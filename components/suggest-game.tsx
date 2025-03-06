"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/games-data";

export default function SuggestGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [gameName, setGameName] = useState("");
  const [gameUrl, setGameUrl] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [gameCategory, setGameCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setGameName("");
        setGameUrl("");
        setGameDescription("");
        setGameCategory("");
        setIsOpen(false);
      }, 3000);
    }, 1000);

    // In a real app, you would submit to your backend
    console.log({
      name: gameName,
      url: gameUrl,
      description: gameDescription,
      category: gameCategory,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Suggest a Game
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Suggest a Game</DialogTitle>
          <DialogDescription>
            Know a great daily game that should be added to our directory? Let
            us know!
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-6 text-center">
            <h3 className="text-lg font-medium text-primary">
              Thank you for your suggestion!
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll review your suggestion and add it to our directory if
              it meets our criteria.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="game-name">Game Name</Label>
              <Input
                id="game-name"
                placeholder="Enter the game's name"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game-url">Game URL</Label>
              <Input
                id="game-url"
                type="url"
                placeholder="https://example.com"
                value={gameUrl}
                onChange={(e) => setGameUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game-category">Category</Label>
              <Select
                value={gameCategory}
                onValueChange={setGameCategory}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="game-description">Description</Label>
              <Textarea
                id="game-description"
                placeholder="Briefly describe the game..."
                value={gameDescription}
                onChange={(e) => setGameDescription(e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !gameName.trim() ||
                  !gameUrl.trim() ||
                  !gameDescription.trim() ||
                  !gameCategory ||
                  isSubmitting
                }
              >
                {isSubmitting ? "Submitting..." : "Submit Suggestion"}
              </Button>
            </DialogFooter>
          </form>
        )}

        <div className="pt-2 text-xs text-muted-foreground">
          <p>
            You can also submit game suggestions directly on our{" "}
            <a
              href="https://github.com/liny18/daily-games-hub/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub repository
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
