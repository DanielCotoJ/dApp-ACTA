import { NextResponse } from 'next/server';
import {
  verifyIssuanceCodeRequestSchema,
  verifyIssuanceCodeResponseSchema,
} from '@/lib/schemas/acta-api';

const API_URLS: Record<string, string> = {
  mainnet: process.env.NEXT_PUBLIC_ACTA_API_BASE_URL_MAINNET || 'https://acta.build/api/mainnet',
  testnet: process.env.NEXT_PUBLIC_ACTA_API_BASE_URL_TESTNET || 'https://acta.build/api/testnet',
};

export async function POST(req: Request) {
  try {
    const rawBody: unknown = await req.json().catch(() => ({}));
    const parsedBody = verifyIssuanceCodeRequestSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      const msg = parsedBody.error.issues[0]?.message ?? 'Invalid request body';
      return NextResponse.json({ valid: false, error: msg });
    }

    const { code, adminApiKey, network } = parsedBody.data;
    const net = network === 'mainnet' ? 'mainnet' : 'testnet';
    const baseUrl = API_URLS[net].replace(/\/$/, '');

    const resp = await fetch(`${baseUrl}/admin/issuance-codes/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ACTA-Key': adminApiKey,
      },
      body: JSON.stringify({
        code,
        template_id: 'impacta-certificate',
      }),
    });

    if (!resp.ok) {
      const body: unknown = await resp.json().catch(() => ({}));
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

    const raw: unknown = await resp.json().catch(() => ({}));
    const parsed = verifyIssuanceCodeResponseSchema.safeParse(raw);
    const data = parsed.success ? parsed.data : {};
    return NextResponse.json({ valid: data.valid === true, error: data.error });
  } catch {
    return NextResponse.json(
      { valid: false, error: 'Verification service unavailable.' },
      { status: 503 }
    );
  }
}
