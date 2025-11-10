"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className, disabled }: SliderProps) {
  const v = value?.[0] ?? 0;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={v}
      disabled={disabled}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
      className={cn(
        "w-full appearance-none h-2 rounded bg-zinc-200 outline-none accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100",
        className
      )}
    />
  );
}
