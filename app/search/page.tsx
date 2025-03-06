import { Suspense } from "react";
import { searchGames } from "@/lib/games-data";
import GamesGrid from "@/components/games-grid";
import CategoryFilter from "@/components/category-filter";

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q: query = "" } = await searchParams;
  const games = query ? searchGames(query) : [];

  return (
    <div className="space-y-8">
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
