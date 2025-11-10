"use client";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RANGES } from "./constants";

interface Props {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  onChange: (next: Partial<{ temperature: number; topP: number; topK: number; maxOutputTokens: number }>) => void;
  disabled?: boolean;
}

function InfoIcon() {
  return (
    <svg className="ml-1 h-4 w-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function Row({ label, tooltip, value, children }: { label: string; tooltip: string; value: number; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1">
                <Label>{label}</Label>
                <InfoIcon />
              </div>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{value}</span>
      </div>
      {children}
    </div>
  );
}

export default function ParameterControls(props: Props) {
  const { temperature, topP, topK, maxOutputTokens, onChange, disabled } = props;
  return (
    <div className={cn("grid gap-4")}>      
      <Row label="Temperature" tooltip="Controls randomness; higher = more diverse" value={Number(temperature.toFixed(2))}>
        <Slider
          value={[temperature]}
          min={RANGES.temperature.min}
          max={RANGES.temperature.max}
          step={RANGES.temperature.step}
          onValueChange={([v]) => onChange({ temperature: v })}
          disabled={disabled}
        />
      </Row>

      <Row label="topP" tooltip="Nucleus sampling; probability mass to sample from" value={Number(topP.toFixed(2))}>
        <Slider
          value={[topP]}
          min={RANGES.topP.min}
          max={RANGES.topP.max}
          step={RANGES.topP.step}
          onValueChange={([v]) => onChange({ topP: v })}
          disabled={disabled}
        />
      </Row>

      <Row label="topK" tooltip="Sample from top K tokens" value={topK}>
        <Slider
          value={[topK]}
          min={RANGES.topK.min}
          max={RANGES.topK.max}
          step={RANGES.topK.step}
          onValueChange={([v]) => onChange({ topK: v })}
          disabled={disabled}
        />
      </Row>

      <Row label="Max Output Tokens" tooltip="Upper bound on generated tokens" value={maxOutputTokens}>
        <Slider
          value={[maxOutputTokens]}
          min={RANGES.maxOutputTokens.min}
          max={RANGES.maxOutputTokens.max}
          step={RANGES.maxOutputTokens.step}
          onValueChange={([v]) => onChange({ maxOutputTokens: v })}
          disabled={disabled}
        />
      </Row>
    </div>
  );
}
