"use client";
import pkg from "@/package.json"
import Link from "next/link"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-10 bg-white shadow-md z-50 flex items-center px-6">
      <div className="ml-auto">
        <Link href="/" className="ml-3 text-sm text-blue-600 hover:underline">
            👚 編集
        </Link>
        <Link href="/sim3DDesign" className="ml-3 text-sm text-blue-600 hover:underline">
            👀 デザイン確認
        </Link>
        <Link href="/admin" className="ml-3 text-sm text-blue-600 hover:underline">
            ⚙️ 業者確認用
        </Link>
      </div>
      <p className="mt-auto ml-auto text-xs">v{pkg.version}</p>
      
    </header>
  );
}