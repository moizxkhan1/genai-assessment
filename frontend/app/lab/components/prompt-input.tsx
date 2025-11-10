"use client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
  onSubmit?: () => void;
}

export default function PromptInput({
  value,
  onChange,
  disabled,
  className,
  onSubmit,
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" aria-hidden="true" />
        <Label htmlFor="prompt" className="text-sm font-semibold">
          Prompt
        </Label>
      </div>
      <div className="relative">
        <Textarea
          id="prompt"
          name="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt here… (⌘/Ctrl + Enter to submit)"
          disabled={disabled}
          className={cn(
            "resize-none transition-all focus-visible:ring-purple-500",
            className
          )}
          aria-label="Prompt input"
        />
        <div className="absolute bottom-3 right-3 text-[10px] text-zinc-400 dark:text-zinc-600">
          {value.length} chars
        </div>
      </div>
    </div>
  );
}
