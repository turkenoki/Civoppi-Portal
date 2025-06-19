'use client';

import Link from "next/link";
import TshirtsWithDecal from "@/components/orideco/TshirtsWithDecal";

export default function Sim3DDesign() {
  return (
    <main>
      <Link
        href="/orideco/editor/tshirts"
        className="fixed top-25 left-3 z-50 bg-blue-500 text-white px-3 py-1 rounded"
      >
        戻る
      </Link>
      <TshirtsWithDecal />
    </main>
  );
}
