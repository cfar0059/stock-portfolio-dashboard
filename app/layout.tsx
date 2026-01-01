import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Portfolio Dashboard",
  description: "Manage your investment portfolio",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020817]`}
      >
        <AppSidebar />
        <AppHeader />
        <main className="lg:ml-64 pt-14 lg:pt-0">{children}</main>
      </body>
    </html>
  );
}
