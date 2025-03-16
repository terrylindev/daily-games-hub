export type Game = {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  popularity: number; // 1-5 scale for sorting
  createdAt?: Date; // For backward compatibility
};

export type Category = {
  id: string;
  name: string;
  description: string;
};

export const categories: Category[] = [
  {
    id: "word",
    name: "Word Games 📝",
    description: "Daily word puzzles and challenges",
  },
  {
    id: "geography",
    name: "Geography 🌍",
    description: "Test your knowledge of places and locations",
  },
  {
    id: "music",
    name: "Music 🎵",
    description: "Test your music knowledge and listening skills",
  },
  {
    id: "movies",
    name: "Movies & TV 🎬",
    description: "Guess the movie or TV show from a series of clues",
  },
  {
    id: "gaming",
    name: "Gaming 🎮",
    description: "Test your gaming knowledge"
  },
  {
    id: "sports",
    name: "Sports ⚽",
    description: "Sports-themed puzzles and prediction games",
  },
  {
    id: "math",
    name: "Math & Logic 🔢",
    description: "Number puzzles and logic challenges",
  },
  {
    id: "other",
    name: "Other 🎯",
    description: "Various themed daily challenges and puzzles",

  }
];
