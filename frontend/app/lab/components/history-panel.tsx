"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  RefreshCcw,
  Trash2,
  History,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<HistoryItem | null>(
    null
  );
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
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const handleDeleteClick = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(itemToDelete.id);
      const resp = await fetch(`${baseUrl}/api/v1/labs/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (!resp.ok) throw new Error("Failed to delete");

      setItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
      toast.success("Lab run deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (_) {
      toast.error("Failed to delete lab run");
    } finally {
      setDeleting(null);
    }
  };

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Card className="h-full border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="h-full p-4">
          <div className="flex h-full flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-blue-500" aria-hidden="true" />
                <Label className="text-sm font-semibold">History</Label>
              </div>
              <button
                className="rounded-md p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                onClick={() => void load()}
                disabled={loading}
                aria-label="Refresh history"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
            <ScrollArea className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Clock className="mb-2 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      No history yet
                    </p>
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                      Run a generation to see it here
                    </p>
                  </div>
                ) : (
                  items.map((it) => (
                    <div
                      key={it.id}
                      className="group relative transition-colors hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80"
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(it.id)}
                        disabled={deleting === it.id}
                        className="block w-full p-3 pr-10 text-left disabled:opacity-50"
                      >
                        <div className="mb-1.5 line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {it.promptPreview}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(it.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span className="rounded bg-zinc-200 px-1.5 py-0.5 dark:bg-zinc-700">
                            {it.count} responses
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => void handleDeleteClick(it, e)}
                        disabled={deleting === it.id}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        aria-label="Delete lab run"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle>Delete Lab Run</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete this lab run? This action cannot
              be undone.
              {itemToDelete && (
                <div className="mt-3 rounded-md bg-zinc-100 p-3 dark:bg-zinc-900">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {itemToDelete.promptPreview}
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                    {new Date(itemToDelete.createdAt).toLocaleString()} •{" "}
                    {itemToDelete.count} responses
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleting !== null}
              className="!bg-red-600 !text-white hover:!bg-red-700 dark:!bg-red-600 dark:hover:!bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
