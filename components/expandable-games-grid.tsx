"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Game } from "@/lib/games-data";
import GameCard from "@/components/game-card";
import { Button } from "@/components/ui/button";

interface ExpandableGamesGridProps {
  games: Game[];
  title?: string;
  description?: string;
}

export default function ExpandableGamesGrid({
  games,
  title,
  description,
}: ExpandableGamesGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedGames = isExpanded ? games : games.slice(0, 4);
  const hasMoreGames = games.length > 4;

  return (
    <section className="w-full py-6">
      {title && (
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {hasMoreGames && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="group"
          >
            {isExpanded ? (
              <>
                Show Less{" "}
                <ChevronUp className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              </>
            ) : (
              <>
                Show More{" "}
                <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </>
            )}
          </Button>
        </div>
      )}

      {games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-center text-muted-foreground">No games found.</p>
        </div>
      )}
    </section>
  );
}
