"use client";
import pkg from "@/package.json"
import Link from "next/link"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-10 bg-white shadow-md z-50 flex items-center px-6">
      <img src="/civoppi.png" alt="Icon" className="absolute h-20 w-35" />

      <div className="ml-auto">
        <Link href="/" className="ml-3 text-sm text-blue-600 hover:underline">
            🌀 ポータル
        </Link>
        <Link href="/orideco" className="ml-3 text-sm text-blue-600 hover:underline">
            👚 オリジナルグッズを作ろう！
        </Link>
      </div>
      <p className="mt-auto ml-auto text-xs">v{pkg.version}</p>
      
    </header>
  );
}