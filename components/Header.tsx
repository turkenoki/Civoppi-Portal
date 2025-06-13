"use client";
import pkg from "@/package.json"
import Link from "next/link"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-15 bg-white shadow-md z-50 flex items-center px-6">
      <div className="flex items-center space-x-3">
        <Link href="/" className="block h-20">
          <img src="/civoppi.png" alt="home" className="h-full" />
        </Link>
        <Link href="/orideco" className="block h-15">
          <img
            src="/oridecobanner.png"
            alt="orideco"
            className="h-full"
          />
        </Link>
      </div>
      <p className="absolute bottom-0 right-5 text-xs">v{pkg.version}</p>
      
    </header>
  );
}