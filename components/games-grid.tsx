import GameCard from "@/components/game-card";
import { Game } from "@/lib/games-data";

interface GamesGridProps {
  games: Game[];
  title?: string;
  description?: string;
}

export default function GamesGrid({
  games,
  title,
  description,
}: GamesGridProps) {
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
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-center text-muted-foreground">No games found.</p>
        </div>
      )}
    </section>
  );
}
