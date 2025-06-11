'use client';
import Link from 'next/link';

export default function PortalPage() {
  return (
    <main className="flex flex-col items-center justify-center h-full relative p-4">
      <h1 className="text-2xl font-bold mb-4">オリジナルグッズ</h1>
      <ul className="space-y-2">
        <li>
          <Link href="/editor" className="text-blue-600 hover:underline">👚 編集</Link>
        </li>
        <li>
          <Link href="/sim3DDesign" className="text-blue-600 hover:underline">👀 デザイン確認</Link>
        </li>
        <li>
          <Link href="/admin" className="text-blue-600 hover:underline">⚙️ 業者確認用</Link>
        </li>
      </ul>
      <img src="/mascot.png" alt="Mascot" className="absolute right-4 top-1/2 -translate-y-1/2 w-32" />
    </main>
  );
}
