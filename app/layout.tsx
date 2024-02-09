import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

import AuthButton from "@/components/AuthButton";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "School Reports App",
  description:
    "App for teachers to speed up the process of writing school reports. Create personalised reports efficiently, saving time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <Nav>
          <AuthButton />
        </Nav>
        <main className="flex flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
