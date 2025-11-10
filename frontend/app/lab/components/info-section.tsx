"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Thermometer,
  Zap,
  Hash,
  FileText,
  Brain,
  BookOpen,
  Smile,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

const parameters = [
  {
    name: "Temperature",
    icon: Thermometer,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    range: "0 - 2",
    description:
      "Controls randomness in the output. Lower values (0.1-0.5) make responses more focused and deterministic. Higher values (1.0-2.0) increase creativity and diversity.",
  },
  {
    name: "Top P",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    range: "0 - 1",
    description:
      "Nucleus sampling parameter. Controls the cumulative probability mass. Lower values (0.1-0.5) make output more focused, while higher values (0.9-1.0) allow more variety.",
  },
  {
    name: "Top K",
    icon: Hash,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    range: "1 - 100",
    description:
      "Limits sampling to the top K most likely tokens. Lower values (10-30) increase focus, while higher values (60-100) allow more diverse word choices.",
  },
  {
    name: "Max Output Tokens",
    icon: FileText,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    range: "100 - 2000",
    description:
      "Maximum length of the generated response in tokens. Limits how long the model can respond. One token ≈ 4 characters or ¾ of a word.",
  },
];

const metrics = [
  {
    name: "Vocabulary Diversity (TTR)",
    icon: Brain,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    description:
      "Type-Token Ratio measures lexical diversity. Higher percentages (60-80%) indicate rich, varied vocabulary with less repetition. Lower values suggest simpler or more repetitive text.",
  },
  {
    name: "Readability Score",
    icon: BookOpen,
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/20",
    description:
      "Flesch Reading Ease score (0-100). Higher scores (60-80) indicate easier-to-read text. Lower scores (30-50) suggest more complex, academic writing.",
  },
  {
    name: "Sentiment",
    icon: Smile,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    description:
      "Emotional tone analysis. Positive (😊) for optimistic/happy content, Neutral (😐) for factual/balanced, and Negative (😔) for critical/sad content.",
  },
];

export default function InfoSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/20">
      <CardContent className="p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between text-left transition-all"
          aria-expanded={isExpanded}
          aria-controls="info-content"
        >
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Understanding Parameters & Metrics
            </h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          )}
        </button>

        {isExpanded && (
          <div id="info-content" className="mt-6 space-y-6">
            {/* Parameters Section */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Generation Parameters
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {parameters.map((param) => {
                  const Icon = param.icon;
                  return (
                    <div
                      key={param.name}
                      className={`rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 ${param.bgColor}`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${param.color}`} />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {param.name}
                          </span>
                          <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                            ({param.range})
                          </span>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {param.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-blue-200 dark:border-blue-900/50" />

            {/* Metrics Section */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Response Metrics
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.name}
                      className={`rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 ${metric.bgColor}`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${metric.color}`} />
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {metric.name}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {metric.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Usage Tip */}
            <div className="rounded-lg border border-blue-300 bg-blue-100/50 p-3 dark:border-blue-800 dark:bg-blue-900/30">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <strong>💡 Tip:</strong> Adjust parameters to see how they
                affect the response quality and metrics. Higher temperature
                often increases vocabulary diversity but may reduce readability.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

