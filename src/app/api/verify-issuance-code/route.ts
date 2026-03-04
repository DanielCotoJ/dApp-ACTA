import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = (await req.json()) as { code?: string };

    const expected = process.env.IMPACTA_BOOTCAMP_CODE;
    if (!expected) {
      return NextResponse.json(
        { valid: false, error: 'Issuance is not configured on this server.' },
        { status: 503 }
      );
    }

    if (!code || code.trim() !== expected.trim()) {
      return NextResponse.json({ valid: false, error: 'Invalid issuance code.' });
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false, error: 'Bad request.' }, { status: 400 });
  }
}
