import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import { DesignElementProvider } from '@/components/orideco/DesignElementContext';
import { EditorContextProvider } from '@/components/orideco/EditorContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orideco",
  description: "オリジナルデザインのアイテムを作ろう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <Header />
        <DesignElementProvider>
          <EditorContextProvider>
            {children}
          </EditorContextProvider>
        </DesignElementProvider>
      </body>
    </html>
  );
}
