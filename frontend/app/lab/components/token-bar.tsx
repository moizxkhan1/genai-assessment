"use client";
import * as React from "react";
import { Progress } from "@/components/ui/progress";
import type { GenerationParameters } from "./types";

interface Props {
  progress: number;
  params: GenerationParameters;
  modelName?: string;
}

export default function TokenBar({
  progress,
  params,
  modelName = "gemini-2.5-flash",
}: Props) {
  return (
    <div className="space-y-2">
      <Progress value={progress} />
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        Processing with <span className="font-semibold">{modelName}</span>
      </div>
    </div>
  );
}
