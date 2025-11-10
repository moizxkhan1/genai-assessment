"use client";
import * as React from "react";
import { useActionState } from "react";
import PromptInput from "./prompt-input";
import MetricsChart from "./metrics-chart";
import ResponseCard from "./response-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ResponseParamsCard from "./response-params-card";
import TokenBar from "./token-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DEFAULTS, RANGES } from "./constants";
import { toast } from "@/components/ui/toast";
import { GenerationParameters, GenerationResult } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ActionFn = (
  prev: unknown,
  formData: FormData
) => Promise<{ ok: boolean; results?: GenerationResult[]; error?: string }>;

function InfoIcon() {
  return (
    <svg
      className="ml-1 h-4 w-4 text-zinc-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export default function LabView({ action }: { action: ActionFn }) {
  const [prompt, setPrompt] = React.useState("");
  const [count, setCount] = React.useState(String(DEFAULTS.count));
  const makeDefaults = (): GenerationParameters => ({
    temperature: DEFAULTS.temperature,
    topP: DEFAULTS.topP,
    topK: DEFAULTS.topK,
    maxOutputTokens: DEFAULTS.maxOutputTokens,
  });
  const [paramSets, setParamSets] = React.useState<GenerationParameters[]>(
    () => Array.from({ length: DEFAULTS.count }, () => makeDefaults())
  );

  const [state, formAction, isPending] = useActionState(action, {
    ok: false,
    results: [],
  });
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (state && state.ok === false && state.error) {
      toast.error(state.error);
    }
  }, [state]);

  React.useEffect(() => {
    if (!isPending) {
      setProgress(0);
      return;
    }
    setProgress(10);
    const id = setInterval(() => {
      setProgress((p) => Math.min(95, p + Math.random() * 8 + 2));
    }, 400);
    return () => clearInterval(id);
  }, [isPending]);

  const results = (state?.results as GenerationResult[]) || [];
  const countNum = Number(count) || DEFAULTS.count;
  const first = paramSets[0] ?? makeDefaults();

  const disabled = isPending;

  return (
    <div className="grid gap-6">
      <h1 className="text-center text-2xl font-semibold">
        LLM Parameter Explorer
      </h1>

      <Card>
        <CardContent className="p-4">
          <form action={formAction} className="grid gap-6">
            {/* Prompt on top, full width */}
            <div>
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                disabled={disabled}
              />
            </div>

            {/* Config below, full width */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="count">Responses</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex">
                          <InfoIcon />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        How many responses to generate
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={count}
                  onValueChange={(v) => {
                    setCount(v);
                    const nextN = Number(v) || DEFAULTS.count;
                    setParamSets((prev) => {
                      if (nextN === prev.length) return prev;
                      if (nextN < prev.length) return prev.slice(0, nextN);
                      const toAdd = nextN - prev.length;
                      const seed = prev[prev.length - 1] ?? makeDefaults();
                      return prev.concat(
                        Array.from({ length: toAdd }, () => ({ ...seed }))
                      );
                    });
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({
                      length: RANGES.count.max - RANGES.count.min + 1,
                    }).map((_, i) => {
                      const v = String(RANGES.count.min + i);
                      return (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <input type="hidden" name="count" value={count} />
              </div>

              {/* Per-response parameter cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paramSets.slice(0, countNum).map((ps, i) => (
                  <ResponseParamsCard
                    key={i}
                    index={i}
                    params={ps}
                    disabled={disabled}
                    onChange={(n) => {
                      setParamSets((prev) => {
                        const next = [...prev];
                        next[i] = { ...next[i], ...n } as GenerationParameters;
                        return next;
                      });
                    }}
                  />
                ))}
              </div>

              {/* Serialized parameters to submit */}
              <input
                type="hidden"
                name="parameters"
                value={JSON.stringify(paramSets.slice(0, countNum))}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={disabled || !prompt.trim()}
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
                    Generating {count} responses...
                  </span>
                ) : (
                  "Generate Responses"
                )}
              </Button>

              {isPending ? (
                <TokenBar progress={progress} params={first} />
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results first */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((r, i) => (
          <ResponseCard key={r.id} result={r} index={i} />
        ))}
      </div>

      {/* Charts below cards */}
      {results.length ? <MetricsChart results={results} /> : null}
    </div>
  );
}
