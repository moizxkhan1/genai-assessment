"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ParameterControls from "./parameter-controls";
import type { GenerationParameters } from "./types";

interface Props {
  index: number;
  params: GenerationParameters;
  disabled?: boolean;
  onChange: (next: Partial<GenerationParameters>) => void;
}

export default function ResponseParamsCard({ index, params, disabled, onChange }: Props) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="text-sm font-medium">Response {index + 1} parameters</div>
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
