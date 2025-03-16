import { Suspense } from "react";
import { Game } from "@/lib/games-data";
import { searchGames } from "@/lib/game-utils";
import GamesGrid from "@/components/games-grid";
import CategoryFilter from "@/components/category-filter";
import type { Metadata } from "next";
import { BreadcrumbJSONLD } from "@/components/json-ld";

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ q?: string }>;
};

// Make the page dynamic
export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable static generation completely

// Generate metadata for the search page
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q: query = "" } = await searchParams;

  return {
    title: query
      ? `Search Results for "${query}" | Daily Games Hub`
      : "Search Games | Daily Games Hub",
    description: query
      ? `Find the best daily games matching "${query}". Browse our collection of word puzzles, geography games, and daily challenges.`
      : "Search for your favorite daily games. Find word puzzles, geography games, trivia, and more daily challenges.",
    robots: {
      index: false, // Don't index search results pages
      follow: true,
    },
    alternates: {
      canonical: "/search",
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q: query = "" } = await searchParams;

  // Use MongoDB search function
  const mongoGames = query ? await searchGames(query) : [];
  const games = mongoGames.map((game) => game as unknown as Game);

  return (
    <div className="space-y-8">
      <BreadcrumbJSONLD
        items={[
          { name: "Home", item: "https://dailygameshub.com/" },
          { name: "Search", item: "https://dailygameshub.com/search" },
        ]}
      />

      <section className="py-6">
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        <p className="mt-2 text-muted-foreground">
          {query
            ? games.length > 0
              ? `Found ${games.length} game${
                  games.length === 1 ? "" : "s"
                } for "${query}"`
              : `No games found for "${query}"`
            : "Enter a search term to find games"}
        </p>
      </section>

      <CategoryFilter />

      <Suspense fallback={<div>Searching games...</div>}>
        <GamesGrid games={games} />
      </Suspense>
    </div>
  );
}
