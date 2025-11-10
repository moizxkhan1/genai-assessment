import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GenerationResult } from "@/lib/types/llm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import { sentimentToCategory } from "./utils";
import {
  Thermometer,
  Zap,
  Hash,
  FileText,
  Brain,
  BookOpen,
  Smile,
  Clock,
} from "lucide-react";

const sentimentIcons = {
  Positive: "😊",
  Neutral: "😐",
  Negative: "😔",
};

export default function ResponseCard({
  result,
  index,
}: {
  result: GenerationResult;
  index: number;
}) {
  const { parameters, response, metrics, generatedAt } = result;
  const sentiment = sentimentToCategory(metrics.sentiment);

  return (
    <Card className="flex flex-col shadow-md transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Response {index + 1}
          </CardTitle>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {metrics.wordCount} words
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Parameters Section */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Parameters
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1.5 dark:bg-orange-950/20">
              <Thermometer className="h-3 w-3 text-orange-500" />
              <span className="text-zinc-700 dark:text-zinc-300">
                Temp: <strong>{parameters.temperature}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1.5 dark:bg-blue-950/20">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-zinc-700 dark:text-zinc-300">
                TopP: <strong>{parameters.topP}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-1.5 dark:bg-purple-950/20">
              <Hash className="h-3 w-3 text-purple-500" />
              <span className="text-zinc-700 dark:text-zinc-300">
                TopK: <strong>{parameters.topK}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1.5 dark:bg-green-950/20">
              <FileText className="h-3 w-3 text-green-500" />
              <span className="text-zinc-700 dark:text-zinc-300">
                Max: <strong>{parameters.maxOutputTokens}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Response Text */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Generated Text
          </div>
          <ScrollArea className="h-56 rounded-lg border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="p-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {response || (
                <span className="italic text-zinc-400">No content</span>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Metrics Section */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Metrics
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1.5 dark:bg-indigo-950/20">
              <Brain className="h-3 w-3 text-indigo-500" />
              <span className="text-zinc-700 dark:text-zinc-300">
                Vocab:{" "}
                <strong>{formatPercent(metrics.vocabularyDiversity)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-teal-50 px-2 py-1.5 dark:bg-teal-950/20">
              <BookOpen className="h-3 w-3 text-teal-500" />
              <span className="text-zinc-700 dark:text-zinc-300">
                Read: <strong>{formatPercent(metrics.readability)}</strong>
              </span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 dark:bg-amber-950/20">
              <span className="text-lg leading-none">
                {sentimentIcons[sentiment]}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">
                Sentiment: <strong>{sentiment}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 border-t border-zinc-200 pt-3 text-[10px] text-zinc-500 dark:border-zinc-800">
          <Clock className="h-3 w-3" />
          <span>{new Date(generatedAt).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
