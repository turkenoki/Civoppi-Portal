import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import { DesignElementProvider } from '@/components/DesignElementContext';
import { EditorContextProvider } from '@/components/EditorContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header/>
      <DesignElementProvider>
        <EditorContextProvider>
          {children}
        </EditorContextProvider>
      </DesignElementProvider>
    </div>
  );
}
