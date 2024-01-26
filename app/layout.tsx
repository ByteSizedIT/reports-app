import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

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
        <nav className="w-full flex justify-between h-16 items-center px-8 text-sm flex-none">
          <p className="cursor-pointer">LOGO</p>
          <a className="cursor-pointer">Auth button</a>
        </nav>
        <main className="flex flex-col items-center justify-center  flex-1">
          {children}
        </main>
        <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs flex-none">
          <p>&copy; 2024</p>
        </footer>
      </body>
    </html>
  );
}
