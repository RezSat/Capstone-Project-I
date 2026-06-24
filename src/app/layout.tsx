import type { Metadata } from "next";
import { Geist_Mono, Inter, Open_Sans, Oswald } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/components/providers";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans-next",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald-next",
  weight: ["200", "300","400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Storefront Inventory Platform",
  description: "Inventory Management System with E-Commerce Frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", "font-sans", inter.variable, openSans.variable, oswald.variable, geistMono.variable)}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
