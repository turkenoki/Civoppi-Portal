'use client';
import Link from 'next/link';

export default function PortalPage() {
  return (
    <main className="flex flex-col items-center justify-center h-full relative p-4">
      <img
        alt="orideco"
        src="/oridecobanner.png"
        className="w-100 h-50"
      />

      <ul className="mt-5 flex flex-row space-x-4">
        <li>
          <Link href="/orideco/editor/tshirts" className="text-blue-600 hover:underline">
            <div className="flex flex-col items-center w-32 border rounded p-2 space-y-1">
              <img
                alt="Tシャツ"
                src="/models/tshirt_front_white.png"
                className="w-32"
              />
              <hr className="w-full border-t my-1" />
              <span className="text-center">Tシャツ</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/orideco/editor/toto" className="text-blue-600 hover:underline">
            <div className="flex flex-col items-center w-32 border rounded p-2 space-y-1">
              <img
                alt="トートバッグ"
                src="/models/toto_front_white.png"
                className="w-32"
              />
              <hr className="w-full border-t my-1" />
              <span className="text-center">トートバッグ</span>
            </div>
          </Link>
        </li>
      </ul>
    </main>
  );
}
