import { rm } from 'fs/promises';
import path from 'path';
import os from 'os';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const dir = path.join(os.tmpdir(), 'tshirtsEditor', params.id);

  try {
    await rm(dir, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('削除エラー:', err);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}