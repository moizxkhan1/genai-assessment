"use client";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import type { GenerationResult } from "@/lib/types/llm";
import { buildChartData } from "./utils";

export default function MetricsChart({ results }: { results: GenerationResult[] }) {
  const data = buildChartData(results);
  if (!results.length) return null;
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip
            formatter={(value: number | string, name: string) => {
              if (name === "Sentiment") {
                const v = typeof value === "number" ? value : Number(value);
                const label = v <= 25 ? "Negative" : v >= 75 ? "Positive" : "Neutral";
                return [label, name];
              }
              const n = typeof value === "number" ? value : Number(value);
              return [`${n.toFixed(1)}`, name];
            }}
          />
          <Legend />
          <Bar dataKey="TTR" fill="#8884d8" />
          <Bar dataKey="Readability" fill="#82ca9d" />
          <Bar dataKey="Sentiment" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
