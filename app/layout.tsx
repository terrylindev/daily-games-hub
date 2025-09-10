import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "../components/header";
import Footer from "../components/footer";
import { Toaster } from "sonner";
import { WebsiteJSONLD } from "@/components/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Daily Games Hub | Your One-Stop Directory for Popular Daily Games",
    template: "%s | Daily Games Hub",
  },
  description:
    "Discover and play the best daily games like Wordle, Connections, TimeGuessr and more. Your curated collection of word puzzles, geography games, and daily challenges.",
  keywords: [
    "daily games",
    "wordle",
    "connections",
    "puzzle games",
    "word games",
    "geography games",
    "daily challenges",
  ],
  authors: [{ name: "Terry Lin" }],
  creator: "Daily Games Hub",
  publisher: "Daily Games Hub",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL("https://dailygameshub.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Daily Games Hub | Your One-Stop Directory for Popular Daily Games",
    description:
      "Discover and play the best daily games like Wordle, Connections, TimeGuessr and more.",
    url: "https://dailygameshub.com",
    siteName: "Daily Games Hub",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Daily Games Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Games Hub | Your One-Stop Directory for Popular Daily Games",
    description:
      "Discover and play the best daily games like Wordle, Connections, TimeGuessr and more.",
    images: ["/images/twitter-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon-precomposed.png",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "zOdloIUZ8_WbIvRSkIDiCYWnGMGdj1V2zLqHbPkvGWA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <WebsiteJSONLD
          url="https://dailygameshub.com"
          name="Daily Games Hub"
          description="Your one-stop directory for popular daily games like Wordle, Connections, TimeGuessr and more."
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
