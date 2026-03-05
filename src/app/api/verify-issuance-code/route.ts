import { NextResponse } from 'next/server';

const API_URLS: Record<string, string> = {
  mainnet: process.env.NEXT_PUBLIC_ACTA_API_BASE_URL_MAINNET || 'https://acta.build/api/mainnet',
  testnet: process.env.NEXT_PUBLIC_ACTA_API_BASE_URL_TESTNET || 'https://acta.build/api/testnet',
};

export async function POST(req: Request) {
  try {
    const { code, adminApiKey, network } = (await req.json()) as {
      code?: string;
      adminApiKey?: string;
      network?: string;
    };

    if (!code?.trim()) {
      return NextResponse.json({ valid: false, error: 'Issuance code is required.' });
    }

    if (!adminApiKey?.trim()) {
      return NextResponse.json({ valid: false, error: 'Admin API key is required.' });
    }

    const net = network === 'mainnet' ? 'mainnet' : 'testnet';
    const baseUrl = API_URLS[net].replace(/\/$/, '');

    const resp = await fetch(`${baseUrl}/admin/issuance-codes/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ACTA-Key': adminApiKey.trim(),
      },
      body: JSON.stringify({
        code: code.trim(),
        template_id: 'impacta-certificate',
      }),
    });

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      const msg =
        typeof body === 'object' && body !== null && 'error' in body
          ? String((body as Record<string, unknown>).error)
          : `Verification service returned ${resp.status}`;

      if (resp.status === 401) {
        return NextResponse.json({ valid: false, error: 'Invalid admin API key.' });
      }

      return NextResponse.json(
        { valid: false, error: msg },
        { status: resp.status >= 500 ? 503 : 400 }
      );
    }

    const data = (await resp.json()) as { valid?: boolean; error?: string };
    return NextResponse.json({ valid: data.valid === true, error: data.error });
  } catch {
    return NextResponse.json(
      { valid: false, error: 'Verification service unavailable.' },
      { status: 503 }
    );
  }
}
