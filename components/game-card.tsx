"use client";

import { useState, useEffect } from "react";
import { ExternalLinkIcon, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Game } from "@/lib/games-data";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Load favorite status from localStorage on mount
  useEffect(() => {
    const favoriteGames = JSON.parse(
      localStorage.getItem("favoriteGames") || "[]"
    );
    setIsFavorite(favoriteGames.includes(game.id));
  }, [game.id]);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(game.url, "_blank", "noopener,noreferrer");
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Get existing favorites from localStorage
    const existingFavorites = JSON.parse(
      localStorage.getItem("favoriteGames") || "[]"
    );

    if (!isFavorite) {
      // Add to favorites
      localStorage.setItem(
        "favoriteGames",
        JSON.stringify([...existingFavorites, game.id])
      );
    } else {
      // Remove from favorites
      localStorage.setItem(
        "favoriteGames",
        JSON.stringify(existingFavorites.filter((id: string) => id !== game.id))
      );
    }

    setIsFavorite(!isFavorite);
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      word: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20",
      geography: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
      trivia: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
      math: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
      music: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
      sports: "bg-sky-500/10 text-sky-500 hover:bg-sky-500/20",
    };

    return (
      colors[category] || "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20"
    );
  };

  // Get category name
  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      word: "Word",
      geography: "Geography",
      trivia: "Trivia",
      math: "Math",
      music: "Music",
      sports: "Sports",
    };

    return categories[category] || category;
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg group border-muted/60">
      <CardContent className="px-3 py-1 relative">
        <div className="flex justify-between items-start mb-3">
          <Badge
            variant="outline"
            className={`${getCategoryColor(game.category)} transition-colors`}
          >
            {getCategoryName(game.category)}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted"
            onClick={handleFavoriteClick}
          >
            <Star
              className={`h-4 w-4 ${
                isFavorite
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
            <span className="sr-only">Favorite</span>
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{game.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {game.description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2 p-4 pt-0">
        <div className="flex flex-wrap gap-1 min-h-[1.75rem]">
          {game.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button
          className="mt-2 w-full cursor-pointer transition-colors hover:bg-primary/90"
          onClick={handlePlayClick}
        >
          Play Now <ExternalLinkIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
