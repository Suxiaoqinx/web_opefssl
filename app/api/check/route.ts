import { NextResponse } from 'next/server';
import https from 'https';
import http2 from 'http2';
import tls from 'tls';
import { URL } from 'url';
import * as cheerio from 'cheerio';
import dns from 'dns';
import geoip from 'geoip-lite';

// Helper to promisify dns.resolveCname
const resolveCname = (hostname: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        dns.resolveCname(hostname, (err, addresses) => {
            if (err) reject(err);
            else resolve(addresses);
        });
    });
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing "url" query parameter' }, { status: 400 });
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
            geo = geoip.lookup(tlsData.site.ip);
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
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TLSChecker/1.0)' } as any,
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        
        const title = $('title').text() || '';
        const description = $('meta[name="description"]').attr('content') || '';
        
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
