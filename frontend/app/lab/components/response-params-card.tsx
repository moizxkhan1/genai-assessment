"use client";
import { Card, CardContent } from "@/components/ui/card";
import ParameterControls from "./parameter-controls";
import type { GenerationParameters } from "./types";
import { Settings2 } from "lucide-react";

interface Props {
  index: number;
  params: GenerationParameters;
  disabled?: boolean;
  onChange: (next: Partial<GenerationParameters>) => void;
}

export default function ResponseParamsCard({
  index,
  params,
  disabled,
  onChange,
}: Props) {
  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
          <Settings2 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Response {index + 1} Parameters
          </div>
        </div>
        <ParameterControls
          temperature={params.temperature}
          topP={params.topP}
          topK={params.topK}
          maxOutputTokens={params.maxOutputTokens}
          onChange={onChange}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
