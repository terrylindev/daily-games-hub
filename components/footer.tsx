import { Github } from "lucide-react";

export default function Footer() {
  const quotes = [
    "Life is more fun if you play games! 🎮",
    "Every day is a new game to win! 🏆",
    "Keep calm and play daily games! 🎲",
    "Level up your daily routine! ⭐",
    "One game a day keeps boredom away! 🎯",
  ];

  // Get a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:py-0 max-w-7xl mx-auto px-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            <span className="font-medium italic">{randomQuote}</span>
            <br />
            <span className="text-xs flex items-center justify-center gap-4 mt-2">
              <span>&copy; {new Date().getFullYear()} Daily Games Hub</span>
              <a
                href="https://github.com/liny18/daily-games-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
