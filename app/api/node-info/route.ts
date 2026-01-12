import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders });
        }

        const { timestamp, hash } = body;
        const secret = 'wyyapi-salt-2026';
        
        // Validate timestamp (5 minutes window)
        if (!timestamp || Math.abs(Date.now() - Number(timestamp)) > 300000) {
            return NextResponse.json({ error: 'Request expired or invalid timestamp' }, { status: 403, headers: corsHeaders });
        }

        // Validate hash
        const str = `${timestamp}${secret}`;
        const expectedHash = crypto.createHash('sha256').update(str).digest('hex');

        if (hash !== expectedHash) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403, headers: corsHeaders });
        }

        // Fetch the server's own IP info
        const res = await fetch('http://ip-api.com/json/?lang=zh-CN');
        if (!res.ok) {
             return NextResponse.json({ error: 'Failed to fetch node info' }, { status: 500, headers: corsHeaders });
        }
        const data = await res.json();
        return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
        console.error('Node info fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}
