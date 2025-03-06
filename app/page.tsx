import { Suspense } from "react";
import { games, categories, getGamesByCategory } from "@/lib/games-data";
import CategoryFilter from "@/components/category-filter";
import SuggestGame from "@/components/suggest-game";
import ExpandableGamesGrid from "../components/expandable-games-grid";

export default function Home() {
  // Get popular games (sorted by popularity)
  const popularGames = [...games]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 12);

  return (
    <div className="space-y-8">
      <section className="py-10">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Daily Games Hub
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Your one-stop directory for popular daily games like Wordle,
            Connections, and more.
          </p>
          <div className="flex justify-center mt-8">
            <SuggestGame />
          </div>
        </div>
      </section>

      <CategoryFilter />

      <Suspense fallback={<div>Loading popular games...</div>}>
        <ExpandableGamesGrid
          games={popularGames}
          title="Popular Games 🔥"
          description="The most popular daily games to play right now"
        />
      </Suspense>

      {categories.map((category) => {
        const categoryGames = getGamesByCategory(category.id);
        if (categoryGames.length === 0) return null;

        return (
          <Suspense
            key={category.id}
            fallback={<div>Loading {category.name}...</div>}
          >
            <ExpandableGamesGrid
              games={categoryGames}
              title={category.name}
              description={category.description}
            />
          </Suspense>
        );
      })}
    </div>
  );
}
