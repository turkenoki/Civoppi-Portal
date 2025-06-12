'use client';
import Link from 'next/link';

export default function PortalPage() {
  return (
    <main className="flex flex-col items-center justify-center h-full relative p-4">
      <h1 className="text-2xl font-bold mb-4">オリジナルグッズ</h1>
      <ul className="space-y-2">
        <li>
          <Link href="/orideco/editor/tshirts" className="text-blue-600 hover:underline"><img alt="Tシャツ" src="/models/tshirts_front_white.png"  className="right-4 top-1/2 -translate-y-1/2 w-32" /></Link>
        </li>
        <li>
          <Link href="/orideco/editor/toto" className="text-blue-600 hover:underline"><img alt="トートバッグ" src="/models/toto_front_white.png"  className="right-4 top-1/2 -translate-y-1/2 w-32" /></Link>
        </li>
        <li>
          <Link href="/orideco/admin" className="text-blue-600 hover:underline">⚙️ 業者確認用</Link>
        </li>
      </ul>
    </main>
  );
}
