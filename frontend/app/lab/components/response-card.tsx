import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GenerationResult } from "@/lib/types/llm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import { sentimentToCategory } from "./utils";

export default function ResponseCard({ result, index }: { result: GenerationResult; index: number }) {
  const { parameters, response, metrics, generatedAt } = result;
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Response {index + 1}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-[10px]">
          <Badge className="uppercase">Temp {parameters.temperature}</Badge>
          <Badge className="uppercase">TopP {parameters.topP}</Badge>
          <Badge className="uppercase">TopK {parameters.topK}</Badge>
          <Badge className="uppercase">Max {parameters.maxOutputTokens}</Badge>
        </div>
        <ScrollArea className="h-52 rounded border border-zinc-200 dark:border-zinc-800">
          <div className="p-3 text-sm">
            {response || <span className="text-zinc-400">No content</span>}
          </div>
        </ScrollArea>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <Badge>Vocab: {formatPercent(metrics.vocabularyDiversity)}</Badge>
          <Badge>Readability: {formatPercent(metrics.readability)}</Badge>
          <Badge>Sentiment: {sentimentToCategory(metrics.sentiment)}</Badge>
          <Badge>Words: {formatNumber(metrics.wordCount)}</Badge>
        </div>
        <div className="text-[10px] text-zinc-500">{new Date(generatedAt).toLocaleTimeString()}</div>
      </CardContent>
    </Card>
  );
}
