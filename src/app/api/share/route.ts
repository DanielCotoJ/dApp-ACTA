import { NextResponse } from 'next/server';

const store = new Map<string, unknown>();

function createShortId(): string {
  // Compact, URL-safe identifier (~16 chars) for shorter share links.
  const part1 = Math.random().toString(36).slice(2, 10);
  const part2 = Math.random().toString(36).slice(2, 6);
  const raw = (part1 + part2).replace(/[^a-z0-9]/gi, '');
  return raw.slice(0, 16) || Math.random().toString(36).slice(2, 10);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const id = createShortId();
    store.set(id, data);
    return NextResponse.json({ id });
  } catch (e) {
    console.error('share_store_error', e);
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key') || '';
    if (!key || !store.has(key)) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(store.get(key));
  } catch (e) {
    console.error('share_get_error', e);
    return NextResponse.json(null, { status: 400 });
  }
}
