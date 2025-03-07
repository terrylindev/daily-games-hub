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
import { toast } from "sonner";

export default function SuggestGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [gameName, setGameName] = useState("");
  const [gameUrl, setGameUrl] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [gameCategory, setGameCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [issueUrl, setIssueUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Get the category name from the category ID
      const categoryObj = categories.find((c) => c.id === gameCategory);
      const categoryName = categoryObj?.name || "";

      // Submit to our API endpoint
      const response = await fetch("/api/suggest-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: gameName,
          url: gameUrl,
          description: gameDescription,
          category: gameCategory,
          categoryName: categoryName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit suggestion");
      }

      // Show success message
      setIsSubmitted(true);

      // Store the issue URL if available
      if (data.issueUrl) {
        setIssueUrl(data.issueUrl);
      }

      // Reset form fields but keep dialog open with success message
      setGameName("");
      setGameUrl("");
      setGameDescription("");
      setGameCategory("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setIsSubmitting(false);
      toast.error("Failed to submit suggestion. Please try again.");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Reset form when dialog is closed
          setIsSubmitted(false);
          setGameName("");
          setGameUrl("");
          setGameDescription("");
          setGameCategory("");
          setErrorMessage("");
          setIssueUrl("");
        }
      }}
    >
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
              We&apos;ve received your suggestion and will review it soon.
            </p>
            {issueUrl && (
              <p className="mt-4 text-sm">
                <a
                  href={issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View your suggestion on GitHub
                </a>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {errorMessage && (
              <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">
                {errorMessage}
              </div>
            )}
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
                <SelectTrigger className="cursor-pointer">
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
                className="cursor-pointer"
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
