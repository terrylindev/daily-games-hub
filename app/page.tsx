import { Suspense } from "react";
import { categories, Game } from "@/lib/games-data";
import CategoryFilter from "@/components/category-filter";
import SuggestGame from "@/components/suggest-game";
import ExpandableGamesGrid from "../components/expandable-games-grid";
import {
  getGamesFromMongoDB,
  getGamesByCategory as getGamesByCategoryFromDB,
} from "@/lib/game-utils";

// This makes the page dynamic so it fetches fresh data on each request
export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable static generation completely

export default async function Home() {
  // Fetch all games from MongoDB
  const mongoGames = await getGamesFromMongoDB();
  const games = mongoGames.map((game) => game as unknown as Game);

  // Get popular games (sorted by popularity)
  const popularGames = [...games]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 12);

  // Log the number of games for debugging
  console.log(`Rendering home page with ${games.length} total games`);

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

      {categories.map((category) => (
        <CategorySection
          key={category.id}
          categoryId={category.id}
          title={category.name}
          description={category.description}
        />
      ))}
    </div>
  );
}

// Separate component for category sections to allow for independent loading
async function CategorySection({
  categoryId,
  title,
  description,
}: {
  categoryId: string;
  title: string;
  description: string;
}) {
  // Fetch games for this category directly from MongoDB
  const categoryGamesFromDB = await getGamesByCategoryFromDB(categoryId);
  const categoryGames = categoryGamesFromDB.map(
    (game) => game as unknown as Game
  );

  if (categoryGames.length === 0) return null;

  return (
    <Suspense fallback={<div>Loading {title}...</div>}>
      <ExpandableGamesGrid
        games={categoryGames}
        title={title}
        description={description}
      />
    </Suspense>
  );
}
