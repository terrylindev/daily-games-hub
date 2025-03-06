export type Game = {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  popularity: number; // 1-10 scale for sorting
};

export type Category = {
  id: string;
  name: string;
  description: string;
};

export const categories: Category[] = [
  {
    id: "word",
    name: "Word Games",
    description: "Daily word puzzles and challenges",
  },
  {
    id: "geography",
    name: "Geography",
    description: "Test your knowledge of places and locations",
  },
  {
    id: "math",
    name: "Math & Logic",
    description: "Number puzzles and logic challenges",
  },
  {
    id: "music",
    name: "Music",
    description: "Test your music knowledge and listening skills",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Sports-themed puzzles and prediction games",
  },
    {
    id: "trivia",
    name: "Trivia",
    description: "Daily trivia and knowledge challenges",
  },
];

export const games: Game[] = [
  {
    id: "wordle",
    name: "Wordle",
    description: "Guess the five-letter word in six tries with color-coded hints",
    url: "https://www.nytimes.com/games/wordle/index.html",
    category: "word",
    tags: ["puzzle"],
    popularity: 10,
  },
  {
    id: "connections",
    name: "Connections",
    description: "Find connections between groups of words",
    url: "https://www.nytimes.com/games/connections",
    category: "word",
    tags: ["puzzle", "groups"],
    popularity: 9,
  },
  {
    id: "worldle",
    name: "Worldle",
    description: "Guess the country by its silhouette",
    url: "https://worldle.teuteuf.fr/",
    category: "geography",
    tags: ["countries"],
    popularity: 8,
  },
  {
    id: "timeguessr",
    name: "TimeGuessr",
    description: "Guess the year a photo was taken",
    url: "https://timeguessr.com/",
    category: "trivia",
    tags: ["history", "photos"],
    popularity: 8,
  },
  {
    id: "globle",
    name: "Globle",
    description: "Guess the country with proximity hints",
    url: "https://globle-game.com/",
    category: "geography",
    tags: ["countries"],
    popularity: 8,
  },
  {
    id: "nerdle",
    name: "Nerdle",
    description: "Guess the equation with number hints",
    url: "https://nerdlegame.com/",
    category: "math",
    tags: ["equation"],
    popularity: 7,
  },
  {
    id: "heardle",
    name: "Heardle",
    description: "Guess the song from short audio clips",
    url: "https://heardlewordle.io/",
    category: "music",
    tags: ["audio"],
    popularity: 8,
  },
  {
    id: "framed",
    name: "Framed",
    description: "Guess the movie from screenshots",
    url: "https://framed.wtf/",
    category: "trivia",
    tags: ["movies", "screenshots"],
    popularity: 7,
  },
  {
    id: "quordle",
    name: "Quordle",
    description: "Solve four Wordle-style puzzles simultaneously",
    url: "https://www.merriam-webster.com/games/quordle/#/",
    category: "word",
    tags: ["puzzle", "multiple"],
    popularity: 7,
  },
  {
    id: "semantle",
    name: "Semantle",
    description: "Guess the word based on semantic similarity",
    url: "https://semantle.com/",
    category: "word",
    tags: ["meaning"],
    popularity: 7,
  },
  {
    id: "immaculate-grid",
    name: "Immaculate Grid",
    description: "Fill a 3x3 grid with players who match the criteria",
    url: "https://www.immaculategrid.com/",
    category: "sports",
    tags: ["grid", "players"],
    popularity: 8,
  },
  {
    id: "poeltl",
    name: "Poeltl",
    description: "Guess the NBA player with limited clues",
    url: "https://poeltl.nbpa.com",
    category: "sports",
    tags: ["basketball", "nba"],
    popularity: 8,
  },
  {
    id: "weddle",
    name: "Weddle",
    description: "Guess the NFL player with limited clues",
    url: "https://www.weddlegame.com/",
    category: "sports",
    tags: ["football", "nfl"],
    popularity: 7,
  },
  {
    id: "crosswordle",
    name: "Crosswordle",
    description: "A crossword-style Wordle variant with multiple words",
    url: "https://crosswordle.vercel.app/",
    category: "word",
    tags: ["puzzle", "crossword"],
    popularity: 7,
  },
  {
    id: "waffle",
    name: "Waffle",
    description: "Rearrange letters to form six words in a waffle pattern",
    url: "https://wafflegame.net/",
    category: "word",
    tags: ["puzzle", "rearrange"],
    popularity: 6,
  },
  {
    id: "mathler",
    name: "Mathler",
    description: "Find the hidden calculation that equals the target number",
    url: "https://www.mathler.com/",
    category: "math",
    tags: ["calculation"],
    popularity: 6,
  },
  {
    id: "countryle",
    name: "Countryle",
    description: "Guess the country with hints about location, population, and more",
    url: "https://countryle.com/",
    category: "geography",
    tags: ["countries"],
    popularity: 6,
  },
  {
    id: "flagle",
    name: "Flagle",
    description: "Guess the country from its flag, revealed piece by piece",
    url: "https://www.flagle.io/",
    category: "geography",
    tags: ["flags"],
    popularity: 7,
  },
  {
    id: "moviedle",
    name: "Moviedle",
    description: "Guess the movie from a 1-second clip that gets longer with each guess",
    url: "https://moviedle.net/",
    category: "trivia",
    tags: ["clips"],
    popularity: 7,
  },
  {
    id: "actorle",
    name: "Actorle",
    description: "Guess the actor from their filmography clues",
    url: "https://actorle.com/",
    category: "trivia",
    tags: ["actors"],
    popularity: 6,
  },
];

// Helper function to get games by category
export function getGamesByCategory(categoryId: string): Game[] {
  return games.filter(game => game.category === categoryId);
}

// Helper function to search games
export function searchGames(query: string): Game[] {
  const lowercaseQuery = query.toLowerCase();
  return games.filter(game => 
    game.name.toLowerCase().includes(lowercaseQuery) ||
    game.description.toLowerCase().includes(lowercaseQuery) ||
    game.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// Helper function to get favorite games
export function getFavoriteGames(): Game[] {
  if (typeof window === 'undefined') return [];
  
  const favoriteIds = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
  return games.filter(game => favoriteIds.includes(game.id));
} 