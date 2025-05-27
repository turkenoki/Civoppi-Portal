import { mkdir, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import {BaseElement} from '@/components/DesignElementContext'
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const rawMeta = formData.get('meta');
  if (!rawMeta || typeof rawMeta !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid meta' }, { status: 400 });
  }

  const meta = JSON.parse(rawMeta) as BaseElement[];

  // ✅ 日時でディレクトリ名を生成
  const now = new Date();
  const folderName = now
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0,14)

  const tmpBase = os.tmpdir()+'\\tshirtsEditor'; // Windowsなら C:\Users\...\AppData\Local\Temp など
  const baseDir = path.join(tmpBase, folderName);
  await mkdir(baseDir, { recursive: true });

  // ✅ meta.json を保存
  await writeFile(path.join(baseDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8');

  // ✅ 各BaseElementに対応する画像ファイルを保存
  for (const element of meta) {
    if (element.type !== 'image') continue;

    const file = formData.get(element.id) as File | null;
    if (!file) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() ?? 'bin';
    const filePath = path.join(baseDir, `${element.id}.${ext}`);

    await writeFile(filePath, buffer);
  }

  return NextResponse.json({ success: true, path: baseDir });
}
