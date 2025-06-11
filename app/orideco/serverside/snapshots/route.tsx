// app/api/snapshots/route.ts
import { readdir, stat } from 'fs/promises';
import os from 'os'
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const baseDir = path.join(os.tmpdir(),'tshirtsEditor');
  const entries = await readdir(baseDir);

  const folders: string[] = [];

  for (const name of entries) {
    const fullPath = path.join(baseDir, name);
    const stats = await stat(fullPath);
    if (stats.isDirectory() ) {
      folders.push(name); 
    }
  }

  // 新しい順にソート
  folders.sort((a, b) => b.localeCompare(a));

  return NextResponse.json({ folders });
}
