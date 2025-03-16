import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Favorites | Daily Games Hub",
  description: "View and manage your favorite daily games. Quick access to your personalized collection of word puzzles, geography games, and daily challenges.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/favorites",
  },
  openGraph: {
    title: "Your Favorites | Daily Games Hub",
    description: "View and manage your favorite daily games.",
    url: "https://dailygameshub.com/favorites",
    type: "website",
  },
}; 