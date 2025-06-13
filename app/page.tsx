'use client';
import Link from 'next/link';

export default function PortalPage() {
  return (
    <main className="flex flex-col items-center justify-center h-full relative p-4">
      <ul className="space-y-2">
        <li>
          <Link href="/orideco" className="text-blue-600 hover:underline">
            <img
              alt="orideco"
              src="/oridecobanner.png"
              className="w-100 h-50"
            />
          </Link>
        </li>
      </ul>
      <img src="/mascot.png" alt="Mascot" className="absolute right-4 top-1/2 -translate-y-1/2 h-128 w-100" />
    </main>
  );
}
