"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
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
import { toast } from "sonner";

// Issue types
const ISSUE_TYPES = [
  { id: "Bug", name: "Bug Report" },
  { id: "Content", name: "Content Issue" },
  { id: "Feature", name: "Feature Request" },
  { id: "Accessibility", name: "Accessibility Issue" },
  { id: "Other", name: "Other" },
];

interface ReportIssueProps {
  gameName?: string;
  gameUrl?: string;
  variant?: "icon" | "button";
  buttonSize?: "sm" | "default" | "lg";
  className?: string;
}

export default function ReportIssue({
  gameName,
  gameUrl,
  variant = "button",
  buttonSize = "default",
  className = "",
}: ReportIssueProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [issueUrl, setIssueUrl] = useState("");

  // Maximum description length
  const MAX_DESCRIPTION_LENGTH = 1000;

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setIssueDescription(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!issueTitle || !issueDescription || !issueType) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Submit to our API endpoint
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: issueTitle,
          description: issueDescription,
          type: issueType,
          gameName: gameName || null,
          gameUrl: gameUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit issue");
      }

      // Show success message
      setIsSubmitted(true);
      toast.success("Issue reported successfully!");

      // Store the issue URL if available
      if (data.issueUrl) {
        setIssueUrl(data.issueUrl);
      }

      // Reset form fields but keep dialog open with success message
      setIssueTitle("");
      setIssueDescription("");
      setIssueType("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting issue:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setIsSubmitting(false);
      toast.error("Failed to submit issue. Please try again.");
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
          setIssueTitle("");
          setIssueDescription("");
          setIssueType("");
          setErrorMessage("");
          setIssueUrl("");
        }
      }}
    >
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            className={className}
            title="Report an issue"
          >
            <AlertCircle className="h-5 w-5" />
          </Button>
        ) : (
          <Button size={buttonSize} variant="outline" className={className}>
            <AlertCircle className="mr-2 h-4 w-4" />
            Report Issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Found a problem or have a suggestion? Let us know!
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-6 text-center">
            <h3 className="text-lg font-medium text-primary">
              Thank you for your report!
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve received your issue report and will look into it soon.
            </p>
            {issueUrl && (
              <p className="mt-4 text-sm">
                <a
                  href={issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View your issue on GitHub
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
                <Label htmlFor="issue-type" className="text-sm">
                  Issue Type
                  <span className="text-red-500">*</span>
                </Label>
                <Select value={issueType} onValueChange={setIssueType} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="issue-title" className="text-sm">
                  Title
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="issue-title"
                  placeholder="Brief summary of the issue"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="issue-description" className="text-sm">
                  Description
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="issue-description"
                  placeholder="Please provide details about the issue..."
                  value={issueDescription}
                  onChange={handleDescriptionChange}
                  required
                  className="mt-1 min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {issueDescription.length}/{MAX_DESCRIPTION_LENGTH} characters
                </p>
              </div>

              {/* Display game info if provided */}
              {gameName && (
                <div className="p-2 bg-muted rounded-md text-sm">
                  <p>
                    <strong>Game:</strong> {gameName}
                  </p>
                  {gameUrl && (
                    <p className="truncate">
                      <strong>URL:</strong> {gameUrl}
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
