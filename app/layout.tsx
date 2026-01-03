import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { AppDesktopHeader } from "@/components/AppDesktopHeader";
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
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AppSidebar />
        <AppHeader />
        <AppDesktopHeader />
        {/* Mobile: pt-14 for mobile header | Desktop: lg:ml-64 for sidebar, lg:pt-12 for desktop header */}
        <main className="pt-14 lg:ml-64 lg:pt-12 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
