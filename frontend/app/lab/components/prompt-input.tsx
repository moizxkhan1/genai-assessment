"use client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function PromptInput({
  value,
  onChange,
  disabled,
  className,
}: Props) {
  return (
    <div className="space-y-4">
      <Label htmlFor="prompt" className="font-bold">
        Prompt
      </Label>
      <Textarea
        id="prompt"
        name="prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask the model anything..."
        disabled={disabled}
        className={cn(className)}
      />
    </div>
  );
}
