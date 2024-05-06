import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

import NavBar from "@/components/nav-bar/NavBar";
import Footer from "@/components/Footer";
import { AppWrapper } from "./context";

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
      <body className="bg-background text-foreground min-h-screen flex flex-col px-8">
        <AppWrapper>
          <NavBar />
          <main className="flex flex-1">{children}</main>
          <Footer />
        </AppWrapper>
      </body>
    </html>
  );
}
