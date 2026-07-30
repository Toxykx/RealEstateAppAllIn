import type { Metadata, Viewport } from "next";
import { Rubik, Frank_Ruhl_Libre } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "hebrew"],
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  variable: "--font-serif",
  subsets: ["latin", "hebrew"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "ALL IN Real Estate",
  description: "בית תיווך יוקרתי — נדל״ן אקסקלוסיבי, ליווי אישי מהצגה ועד חתימה.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ALL IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#14110d",
  // viewport-fit=cover lets the app draw under the iPhone notch/home-indicator
  // area; components then use env(safe-area-inset-*) to pad back in.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.variable} ${frankRuhlLibre.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}
