"use client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function PromptInput({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="prompt">Prompt</Label>
      <Textarea
        id="prompt"
        name="prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask the model anything..."
        disabled={disabled}
      />
    </div>
  );
}
