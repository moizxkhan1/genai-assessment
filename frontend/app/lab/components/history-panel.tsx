"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface HistoryItem {
  id: string;
  promptPreview: string;
  createdAt: string | Date;
  count: number;
}

export default function HistoryPanel({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [items, setItems] = React.useState<HistoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:4000";

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${baseUrl}/api/v1/labs`, { cache: "no-store" });
      const data = (await resp.json()) as { items: HistoryItem[] };
      setItems(data.items || []);
    } catch (_) {
      // noop
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card className="h-full border-none">
      <CardContent className="h-full">
        <div className="space-y-2 h-full">
          <div className="flex items-center justify-between">
            <Label>History</Label>
            <button
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
          <ScrollArea className="h-[calc(100%-1.5rem)] rounded border border-zinc-200 dark:border-zinc-800">
            <div className="divide-y">
              {items.length === 0 ? (
                <div className="p-3 text-sm text-zinc-500">No history yet</div>
              ) : (
                items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => onSelect(it.id)}
                    className="block w-full p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <div className="text-sm line-clamp-2">
                      {it.promptPreview}
                    </div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                      <span>{new Date(it.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>{it.count} responses</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
