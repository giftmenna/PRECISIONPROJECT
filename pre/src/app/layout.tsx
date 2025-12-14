import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Precision Academic World",
  description: "Master English and Mathematics through interactive video lessons and timed practice quizzes. Compete with others and earn gems for perfect scores!",
  manifest: "/manifest.json",
  icons: {
    icon: "/1.jpg",
    shortcut: "/1.jpg",
    apple: "/1.jpg",
  },
  appleWebApp: {
    title: "Precision Academic World",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PrecisionAW" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <link rel="apple-touch-icon" href="/1.jpg" />
        <link rel="icon" type="image/jpeg" sizes="192x192" href="/1.jpg" />
        <link rel="icon" type="image/jpeg" sizes="512x512" href="/1.jpg" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-background`}>
        <Providers>
          {children}
          <PWAInstallBanner />
          <ServiceWorkerRegistration />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}