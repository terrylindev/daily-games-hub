"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { categories, Game } from "@/lib/games-data";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function CategoryFilter() {
  const pathname = usePathname();
  const currentCategory = pathname.startsWith("/category/")
    ? pathname.split("/").pop()
    : null;
  const [isLoading, setIsLoading] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );
  const [totalGames, setTotalGames] = useState(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  // Fetch game counts for each category
  useEffect(() => {
    async function fetchGameCounts() {
      try {
        setIsLoadingCounts(true);
        const response = await fetch("/api/games");
        if (response.ok) {
          const data = await response.json();

          // Calculate counts by category
          const counts: Record<string, number> = {};
          let total = 0;

          if (data.games && Array.isArray(data.games)) {
            total = data.games.length;

            // Count games by category
            data.games.forEach((game: Game) => {
              const category = game.category || "unknown";
              counts[category] = (counts[category] || 0) + 1;
            });
          }

          setCategoryCounts(counts);
          setTotalGames(total);
        }
      } catch (error) {
        console.error("Error fetching game counts:", error);
      } finally {
        setIsLoadingCounts(false);
      }
    }

    fetchGameCounts();
  }, []);

  const handleSurpriseMe = () => {
    setIsLoading(true);

    // Get a random game via API
    fetch("/api/games")
      .then((response) => response.json())
      .then((data) => {
        if (data.games && data.games.length > 0) {
          // Get a random game from the games array
          const randomIndex = Math.floor(Math.random() * data.games.length);
          const randomGame = data.games[randomIndex];

          // Open the game URL in a new tab
          window.open(randomGame.url, "_blank", "noopener,noreferrer");
        }
      })
      .catch((error) => console.error("Error getting random game:", error))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="flex flex-wrap gap-2 py-4">
      <Link href="/">
        <Button
          variant={!currentCategory ? "default" : "outline"}
          size="sm"
          className="cursor-pointer transition-colors hover:bg-primary/90 hover:text-primary-foreground"
        >
          All Games {isLoadingCounts ? "..." : `(${totalGames})`}
        </Button>
      </Link>

      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.id}`}>
          <Button
            variant={currentCategory === category.id ? "default" : "outline"}
            size="sm"
            className="cursor-pointer transition-colors hover:bg-primary/90 hover:text-primary-foreground"
          >
            {category.name}{" "}
            {isLoadingCounts ? "..." : `(${categoryCounts[category.id] || 0})`}
          </Button>
        </Link>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={handleSurpriseMe}
        disabled={isLoading}
        className="cursor-pointer transition-colors hover:bg-primary/90 hover:text-primary-foreground ml-auto"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isLoading ? "Finding..." : "Surprise me!"}
      </Button>
    </div>
  );
}
