// app/api/snapshots/[id]/route.ts
import { NextRequest } from 'next/server';
import path from 'path';
import os from 'os';
import fs from 'fs';
import archiver from 'archiver';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
  ) {
  
  const { id } = await params;  // paramsはPromise<{ id: string }> なのでawaitで中身を取得

  const targetDir = path.join(os.tmpdir + '\\tshirtsEditor', id);

  // フォルダ存在確認
  if (!fs.existsSync(targetDir)) {
    return new Response('Snapshot not found', { status: 404 });
  }

  // ストリームとZIP生成
  const archive = archiver('zip', { zlib: { level: 9 } });


  const zipPromise = new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    archive.directory(targetDir, false); // 中身だけ追加
    archive.finalize();
  });

  const zipBuffer = await zipPromise;

  return new Response(zipBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${id}.zip"`,
      'Content-Length': zipBuffer.length.toString(),
    },
  });
}
