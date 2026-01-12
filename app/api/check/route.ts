import { NextResponse } from 'next/server';
import https from 'https';
import http2 from 'http2';
import tls from 'tls';
import { URL } from 'url';
import * as cheerio from 'cheerio';
import dns from 'dns';
import crypto from 'crypto';

// Rate Limiting Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute
const rateLimitMap = new Map<string, { count: number; expires: number }>();

function checkRateLimit(ip: string) {
    const now = Date.now();
    
    // Lazy cleanup: if map gets too big, clear it to prevent memory leaks
    if (rateLimitMap.size > 5000) {
        rateLimitMap.clear();
    }
    
    const record = rateLimitMap.get(ip);
    
    if (!record || now > record.expires) {
        rateLimitMap.set(ip, {
            count: 1,
            expires: now + RATE_LIMIT_WINDOW
        });
        return { allowed: true };
    }
    
    if (record.count >= MAX_REQUESTS) {
        return { allowed: false };
    }
    
    record.count++;
    return { allowed: true };
}

// Helper to promisify dns.resolveCname
const resolveCname = (hostname: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        dns.resolveCname(hostname, (err, addresses) => {
            if (err) reject(err);
            else resolve(addresses);
        });
    });
};

async function fetchGeoIp(ip: string) {
    if (!ip) return null;
    try {
        // Use ip-api.com for lightweight serverless-friendly lookup
        const res = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.status !== 'success') return null;
        return {
            country: data.country,
            region: data.regionName,
            city: data.city,
            timezone: data.timezone,
            ll: [data.lat, data.lon]
        };
    } catch (e) {
        console.error('GeoIP fetch failed', e);
        return null;
    }
}

export async function POST(request: Request) {
    // Rate Limit Check
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (ip !== 'unknown') {
        const { allowed } = checkRateLimit(ip);
        if (!allowed) {
            return NextResponse.json(
                { error: '请求过于频繁，请稍后再试 (Rate limit exceeded)' },
                { status: 429 }
            );
        }
    }

    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { url: targetUrl, timestamp, hash } = body;

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing "url" parameter' }, { status: 400 });
    }

    // Hash verification
    const secret = 'wyyapi-salt-2026';
    const str = `${targetUrl}${timestamp}${secret}`;
    const expectedHash = crypto.createHash('sha256').update(str).digest('hex');

    if (hash !== expectedHash) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    if (!timestamp || Math.abs(Date.now() - Number(timestamp)) > 300000) {
        return NextResponse.json({ error: 'Request expired or invalid timestamp' }, { status: 403 });
    }

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(targetUrl);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'https:') {
        return NextResponse.json({ error: 'Only HTTPS URLs are supported for TLS checking' }, { status: 400 });
    }

    try {
        const [tlsResult, metaResult, dnsResult, http2Result, tlsVersionsResult] = await Promise.allSettled([
            checkTls(parsedUrl),
            fetchMetadata(parsedUrl.href),
            resolveDns(parsedUrl.hostname),
            checkHttp2(parsedUrl.hostname),
            checkTlsVersions(parsedUrl.hostname, parsedUrl.port)
        ]);

        const tlsData: any = tlsResult.status === 'fulfilled' ? tlsResult.value : null;
        const metaData: any = metaResult.status === 'fulfilled' ? metaResult.value : {};
        const dnsData: any = dnsResult.status === 'fulfilled' ? dnsResult.value : {};
        const isHttp2: boolean = http2Result.status === 'fulfilled' ? (http2Result.value as boolean) : false;
        const supportedTlsVersions: any[] = tlsVersionsResult.status === 'fulfilled' ? (tlsVersionsResult.value as any[]) : [];

        if (!tlsData) {
            return NextResponse.json({ error: 'TLS handshake failed', details: (tlsResult as PromiseRejectedResult).reason }, { status: 500 });
        }

        // Combine GeoIP info if IP is available
        let geo = null;
        if (tlsData.site.ip) {
            geo = await fetchGeoIp(tlsData.site.ip);
        }

        // Check for HTTP/3 via Alt-Svc
        const altSvc = tlsData.http.headers['alt-svc'];
        const isHttp3 = altSvc ? (altSvc.includes('h3') || altSvc.includes('quic')) : false;

        return NextResponse.json({
            target: targetUrl,
            http: {
                ...tlsData.http,
                support: {
                    h1: true, // Assumed if TLS works
                    h2: isHttp2,
                    h3: isHttp3
                }
            },
            tls: {
                ...tlsData.tls,
                supportedVersions: supportedTlsVersions
            },
            certificate: tlsData.certificate,
            timing: tlsData.timing,
            site: {
                ...tlsData.site,
                ...metaData,
                cname: dnsData.cname,
                geo: geo
            }
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function checkTls(parsedUrl: URL) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'HEAD',
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            agent: new https.Agent({
                maxCachedSessions: 0,
                rejectUnauthorized: false
            })
        };

        const start = Date.now();
        let dnsEnd = start;
        let tcpEnd = start;
        let tlsEnd = start;

        const reqClient = https.request(options, (response) => {
            const ttfbEnd = Date.now();
            
            if (dnsEnd === start) dnsEnd = start;
            if (tcpEnd === start) tcpEnd = dnsEnd;
            if (tlsEnd === start) tlsEnd = tcpEnd;

            const timings = {
                dns: Math.max(0, dnsEnd - start),
                tcp: Math.max(0, tcpEnd - dnsEnd),
                tls: Math.max(0, tlsEnd - tcpEnd),
                ttfb: Math.max(0, ttfbEnd - tlsEnd),
                total: Math.max(0, ttfbEnd - start)
            };

            const socket: any = response.socket;

            let certInfo = {};
            let tlsInfo = {};
            
            try {
                const cert = socket.getPeerCertificate(true);
                if (cert) {
                    // Calculate days remaining
                    const validTo = new Date(cert.valid_to);
                    const now = new Date();
                    const diffTime = validTo.getTime() - now.getTime();
                    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                     certInfo = {
                        subject: cert.subject,
                        issuer: cert.issuer,
                        valid_from: cert.valid_from,
                        valid_to: cert.valid_to,
                        fingerprint: cert.fingerprint,
                        serialNumber: cert.serialNumber,
                        daysRemaining: daysRemaining
                    };
                }

                tlsInfo = {
                    version: socket.getProtocol(),
                    cipher: socket.getCipher(),
                    authorized: socket.authorized,
                    authorizationError: socket.authorizationError
                };
            } catch (e) {
                console.error("Error parsing cert/tls info", e);
            }

            const httpInfo = {
                version: response.httpVersion,
                statusCode: response.statusCode,
                headers: response.headers
            };

            const siteInfo = {
                ip: socket.remoteAddress,
                latency: timings.total,
                server: response.headers['server'] || 'N/A'
            };

            resolve({
                http: httpInfo,
                tls: tlsInfo,
                certificate: certInfo,
                timing: timings,
                site: siteInfo
            });
        });

        reqClient.on('socket', (socket) => {
            socket.on('lookup', () => {
                dnsEnd = Date.now();
            });
            socket.on('connect', () => {
                tcpEnd = Date.now();
            });
            socket.on('secureConnect', () => {
                tlsEnd = Date.now();
            });
        });

        reqClient.on('error', (e) => reject(e));
        reqClient.on('timeout', () => {
            reqClient.destroy();
            reject(new Error('Request timed out'));
        });

        reqClient.setTimeout(10000);
        reqClient.end();
    });
}

async function fetchMetadata(url: string) {
    try {
        const res = await fetch(url, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            } as any,
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        
        const title = ($('title').text() || '').trim();
        const description = ($('meta[name="description"]').attr('content') || '').trim();
        
        let favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '/favicon.ico';
        if (favicon && !favicon.startsWith('http')) {
            favicon = new URL(favicon, url).href;
        }

        return { title, description, favicon };
    } catch (e: any) {
        console.error('Metadata fetch failed', e.message);
        return { title: '', description: '', favicon: '' };
    }
}

async function resolveDns(hostname: string) {
    try {
        const cname = await resolveCname(hostname).catch(() => []);
        return { cname: cname[0] || 'N/A' };
    } catch (e) {
        return { cname: 'N/A' };
    }
}

function checkHttp2(hostname: string) {
    return new Promise((resolve) => {
        try {
            const session = http2.connect(`https://${hostname}`, {
                rejectUnauthorized: false
            });
            
            session.on('connect', (session, socket) => {
                 const alpn = (socket as any).alpnProtocol;
                 session.close();
                 resolve(alpn === 'h2');
            });
            
            session.on('error', () => resolve(false));
            session.setTimeout(3000, () => {
                session.close();
                resolve(false);
            });
        } catch (e) {
            resolve(false);
        }
    });
}

function checkTlsVersions(hostname: string, port: string | null) {
    const versions = ['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'];
    const checks = versions.map(version => {
        return new Promise((resolve) => {
            const options: any = {
                hostname: hostname,
                port: port || 443,
                minVersion: version,
                maxVersion: version,
                rejectUnauthorized: false,
                method: 'HEAD' // Use HEAD to minimize data transfer
            };
            
            const req = https.request(options, (res) => {
                resolve({ version, supported: true });
                res.socket.destroy(); // Ensure socket is closed immediately
            });

            req.on('error', (e) => {
                resolve({ version, supported: false });
            });

            req.setTimeout(3000, () => {
                req.destroy();
                resolve({ version, supported: false });
            });
            
            req.end();
        });
    });
    return Promise.all(checks);
}
