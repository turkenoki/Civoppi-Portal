import { rm } from 'fs/promises';
import path from 'path';
import os from 'os';
import { NextRequest,NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
  ) {
  const { id } = await params;
  const dir = path.join(os.tmpdir(), 'tshirtsEditor', id);

  try {
    await rm(dir, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('削除エラー:', err);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}