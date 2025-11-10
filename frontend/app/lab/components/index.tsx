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
import HistoryPanel from "./history-panel";
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
import { Sparkles } from "lucide-react";
import InfoSection from "./info-section";

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
  const [paramSets, setParamSets] = React.useState<GenerationParameters[]>(() =>
    Array.from({ length: DEFAULTS.count }, () => makeDefaults())
  );

  const [state, formAction, isPending] = useActionState(action, {
    ok: false,
    results: [],
  });
  const [progress, setProgress] = React.useState(0);
  const [historyResults, setHistoryResults] = React.useState<
    GenerationResult[] | null
  >(null);

  React.useEffect(() => {
    if (state && state.ok === false && state.error) {
      toast.error(state.error);
    } else if (state && state.ok && state.results && state.results.length > 0) {
      toast.success(
        `Generated ${state.results.length} responses successfully!`
      );
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

  const results =
    historyResults && historyResults.length
      ? historyResults
      : (state?.results as GenerationResult[]) || [];
  const countNum = Number(count) || DEFAULTS.count;
  const first = paramSets[0] ?? makeDefaults();

  const disabled = isPending;
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = React.useCallback(() => {
    if (!prompt.trim() || disabled) return;
    formRef.current?.requestSubmit();
  }, [prompt, disabled]);

  // Clear history results when starting a new generation or after fresh action results arrive
  React.useEffect(() => {
    if (isPending) setHistoryResults(null);
  }, [isPending]);
  React.useEffect(() => {
    if (state?.results && state.results.length) setHistoryResults(null);
  }, [state?.results]);

  async function loadLab(id: string) {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.BACKEND_URL ||
        "http://localhost:4000";
      const resp = await fetch(`${baseUrl}/api/v1/labs/${id}`, {
        cache: "no-store",
      });
      if (!resp.ok) return;
      const lab = await resp.json();
      const params = (lab.parameters || []) as GenerationParameters[];
      setParamSets(params);
      setCount(String(params.length || DEFAULTS.count));
      setPrompt(lab.prompt || "");
      const now = Date.now();
      const mapped: GenerationResult[] = (lab.results || []).map(
        (r: any, idx: number) => ({
          id: `${now}-${idx}`,
          parameters: params[idx] || makeDefaults(),
          response: r.response || "",
          metrics: r.metrics || {
            vocabularyDiversity: 0,
            readability: 0,
            wordCount: 0,
            sentiment: 0,
          },
          generatedAt: lab.createdAt ? new Date(lab.createdAt) : new Date(),
        })
      );
      setHistoryResults(mapped);
    } catch (_) {
      // noop
    }
  }

  return (
    <div className="grid gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          LLM Parameter Explorer
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Experiment with different parameters and compare model outputs
        </p>
      </div>

      <Card className="shadow-md border-none">
        <div className="p-6">
          <InfoSection />
        </div>
        <CardContent className="p-6">
          <form ref={formRef} action={formAction} className="grid gap-6">
            {/* Prompt + Number of Responses | History in aligned grid */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardContent className="flex flex-col justify-between p-6 space-y-4 h-full">
                  <PromptInput
                    value={prompt}
                    onChange={setPrompt}
                    disabled={disabled}
                    className="h-64"
                    onSubmit={handleSubmit}
                  />

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="count" className="text-sm font-semibold">
                        Number of Responses
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex"
                              aria-label="Info about response count"
                            >
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
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({
                          length: RANGES.count.max - RANGES.count.min + 1,
                        }).map((_, i) => {
                          const v = String(RANGES.count.min + i);
                          return (
                            <SelectItem key={v} value={v}>
                              {v} {Number(v) === 1 ? "Response" : "Responses"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="count" value={count} />
                  </div>
                </CardContent>
              </Card>

              <div>
                <HistoryPanel onSelect={(id) => void loadLab(id)} />
              </div>
            </div>

            {/* Config below */}
            <div className="grid gap-4">
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
                className="w-full !text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all hover:shadow-xl"
                size="lg"
                disabled={disabled || !prompt.trim()}
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-100" />
                    Generating {count}{" "}
                    {Number(count) === 1 ? "response" : "responses"}...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Responses
                  </span>
                )}
              </Button>

              {isPending ? (
                <TokenBar progress={progress} params={first} />
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results section */}
      {results.length > 0 && (
        <>
          <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Generated Responses
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {results.map((r, i) => (
                <ResponseCard key={r.id} result={r} index={i} />
              ))}
            </div>
          </div>

          {/* Charts below cards */}
          <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Metrics Comparison
            </h2>
            <MetricsChart results={results} />
          </div>
        </>
      )}
    </div>
  );
}
