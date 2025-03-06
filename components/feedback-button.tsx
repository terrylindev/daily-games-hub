"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
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

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [feedbackText, setFeedbackText] = useState("");
  const [email, setEmail] = useState("");
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
        setFeedbackText("");
        setEmail("");
        setIsOpen(false);
      }, 3000);
    }, 1000);

    // In a real app, you would submit to your backend or directly to GitHub issues
    console.log({
      type: feedbackType,
      feedback: feedbackText,
      email,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Share your suggestions or report issues. Your feedback helps us
            improve!
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-6 text-center">
            <h3 className="text-lg font-medium text-primary">
              Thank you for your feedback!
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We appreciate your input and will review it soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={
                    feedbackType === "suggestion" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setFeedbackType("suggestion")}
                >
                  Suggestion
                </Button>
                <Button
                  type="button"
                  variant={feedbackType === "issue" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFeedbackType("issue")}
                >
                  Report Issue
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts or describe the issue..."
                value={feedbackText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFeedbackText(e.target.value)
                }
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll only use this to follow up on your feedback if
                needed.
              </p>
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
                disabled={!feedbackText.trim() || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </DialogFooter>
          </form>
        )}

        <div className="pt-2 text-xs text-muted-foreground">
          <p>
            You can also submit issues directly on our{" "}
            <a
              href="https://github.com/yourusername/daily-games-hub/issues"
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
