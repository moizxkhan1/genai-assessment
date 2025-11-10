"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ className, sideOffset = 6, ...props }: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 shadow-md animate-in fade-in-80 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
