"use client";
import pkg from "@/package.json"
import Link from "next/link"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-10 bg-white shadow-md z-50 flex items-center px-6">
      <div className="ml-auto flex items-center space-x-3">
        <Link href="/" className="block h-8">
          <img src="/civoppi.png" alt="ポータル" className="h-full" />
        </Link>
        <Link href="/orideco" className="block h-8">
          <img
            src="/oridecobanner.png"
            alt="オリジナルグッズを作ろう"
            className="h-full"
          />
        </Link>
      </div>
      <p className="ml-3 text-xs">v{pkg.version}</p>
      
    </header>
  );
}