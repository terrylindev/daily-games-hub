"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { categories, games } from "@/lib/games-data";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function CategoryFilter() {
  const pathname = usePathname();
  const currentCategory = pathname.startsWith("/category/")
    ? pathname.split("/").pop()
    : null;
  const [isLoading, setIsLoading] = useState(false);

  const handleSurpriseMe = () => {
    setIsLoading(true);

    // Get a random game from the games array
    const randomIndex = Math.floor(Math.random() * games.length);
    const randomGame = games[randomIndex];

    // Short timeout to show loading state
    setTimeout(() => {
      // Open the game URL in a new tab
      window.open(randomGame.url, "_blank", "noopener,noreferrer");
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="flex flex-wrap gap-2 py-4">
      <Link href="/">
        <Button
          variant={!currentCategory ? "default" : "outline"}
          size="sm"
          className="cursor-pointer transition-colors hover:bg-primary/90 hover:text-primary-foreground"
        >
          All Games
        </Button>
      </Link>

      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.id}`}>
          <Button
            variant={currentCategory === category.id ? "default" : "outline"}
            size="sm"
            className="cursor-pointer transition-colors hover:bg-primary/90 hover:text-primary-foreground"
          >
            {category.name}
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
