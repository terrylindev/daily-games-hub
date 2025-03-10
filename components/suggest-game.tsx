"use client";

import { useState } from "react";
import { PlusCircle, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/games-data";
import { toast } from "sonner";

export default function SuggestGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [gameName, setGameName] = useState("");
  const [gameUrl, setGameUrl] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [gameCategory, setGameCategory] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [issueUrl, setIssueUrl] = useState("");
  const [tagInputRef, setTagInputRef] = useState<HTMLInputElement | null>(null);

  // Maximum description length
  const MAX_DESCRIPTION_LENGTH = 100;
  // Maximum tag length
  const MAX_TAG_LENGTH = 20;

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to lowercase and limit length to MAX_TAG_LENGTH characters
    const value = e.target.value.toLowerCase();
    if (value.length <= MAX_TAG_LENGTH) {
      setNewTag(value);
    } else {
      setNewTag(value.slice(0, MAX_TAG_LENGTH));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();

    // Don't add empty tags
    if (!trimmedTag) return;

    // Don't add tags that are too short
    if (trimmedTag.length < 2) {
      toast.error("Tag must be at least 2 characters");
      return;
    }

    // Don't add tags that match the category
    if (trimmedTag === gameCategory) {
      toast.error("Tag should not match the category");
      setNewTag("");
      tagInputRef?.focus();
      return;
    }

    // Don't add duplicate tags
    if (customTags.includes(trimmedTag)) {
      toast.error("Tag already added");
      setNewTag("");
      tagInputRef?.focus();
      return;
    }

    // Limit to 3 tags
    if (customTags.length >= 3) {
      toast.error("Maximum 3 tags allowed");
      return;
    }

    setCustomTags([...customTags, trimmedTag]);
    setNewTag("");
    tagInputRef?.focus();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setGameDescription(value);
    }
  };

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
          tags: customTags,
          email: email.trim() || null,
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
      setCustomTags([]);
      setNewTag("");
      setEmail("");
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
          setCustomTags([]);
          setNewTag("");
          setEmail("");
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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
              {email
                ? `We've received your suggestion and will review it soon. We'll notify you when we make a decision.`
                : `We've received your suggestion and will review it soon.`}
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
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            {errorMessage && (
              <div className="p-2 text-sm bg-red-50 text-red-500 rounded-md">
                {errorMessage}
              </div>
            )}

            {/* Basic Info Section */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="game-name" className="text-sm">
                  Game Name
                </Label>
                <Input
                  id="game-name"
                  placeholder="Enter the game's name"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="game-url" className="text-sm">
                  Game URL
                </Label>
                <Input
                  id="game-url"
                  type="url"
                  placeholder="https://example.com"
                  value={gameUrl}
                  onChange={(e) => setGameUrl(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="game-category" className="text-sm">
                  Category
                </Label>
                <Select
                  value={gameCategory}
                  onValueChange={(value) => {
                    setGameCategory(value);
                    // Remove any tags that match the new category
                    setCustomTags(customTags.filter((tag) => tag !== value));
                  }}
                  required
                >
                  <SelectTrigger className="cursor-pointer mt-1">
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
            </div>

            {/* Custom Tags Section */}
            <div className="pt-1">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Tags (Up to 3)</Label>
                <span className="text-xs text-muted-foreground">
                  {customTags.length}/3
                </span>
              </div>

              <div className="flex mt-1">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={handleTagInputChange}
                    onKeyDown={handleKeyDown}
                    className="pr-12"
                    disabled={customTags.length >= 3}
                    ref={(el) => {
                      setTagInputRef(el);
                    }}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {newTag.length}/{MAX_TAG_LENGTH}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || customTags.length >= 3}
                  className="ml-2"
                >
                  Add
                </Button>
              </div>

              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {customTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="bg-primary text-primary-foreground text-xs py-0.5 flex items-center"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTag(tag);
                        }}
                        className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-primary-foreground/20"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Description Section */}
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="game-description" className="text-sm">
                  Description
                </Label>
                <span className="text-xs text-muted-foreground">
                  {gameDescription.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                id="game-description"
                placeholder="Briefly describe the game..."
                value={gameDescription}
                onChange={handleDescriptionChange}
                required
                className="mt-1 min-h-[80px]"
              />
            </div>

            {/* Email Section */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email (Optional)</Label>
                <span className="text-xs text-muted-foreground">
                  Get notified when your game is added
                </span>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer"
                size="sm"
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
                size="sm"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
