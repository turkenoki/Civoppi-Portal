'use client';
import Link from 'next/link';

export default function PortalPage() {
  return (
    <main
      className="flex flex-col items-center justify-center h-full relative p-4"
      style={{
        backgroundImage: "url('/mascot.png')",
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
      }}
    >
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
    </main>
  );
}
