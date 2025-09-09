"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/games-data";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface CategoryFilterProps {
  categoryCounts: Record<string, number>;
}

export default function CategoryFilter({ categoryCounts }: CategoryFilterProps) {
  const pathname = usePathname();
  const currentCategory = pathname.startsWith("/category/")
    ? pathname.split("/").pop()
    : null;
  const [isLoading, setIsLoading] = useState(false);
  
  const totalGames = categoryCounts.total || 0;


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
          All Games ({totalGames})
        </Button>
      </Link>

      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.id}`}>
          <Button
            variant={currentCategory === category.id ? "default" : "outline"}
            size="sm"
            className="cursor-pointer transition-colors hover:bg-primary/90 hover:text-primary-foreground"
          >
            {category.name} ({categoryCounts[category.id] || 0})
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
