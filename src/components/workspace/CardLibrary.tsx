import { useMemo, useState, type DragEvent } from "react";
import { ChevronRight, GripVertical, Plus, Check, Search, Workflow, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTemplates } from "./templates/store";
import type { ModuleKey } from "./templates/types";

const moduleTitle: Record<ModuleKey, string> = {
  em: "电磁性能",
  thermal: "温升",
  stress: "应力",
  nvh: "振动噪音",
};

/**
 * Floating card library panel — Bilibili-inspired:
 * - Clean white floating card, rounded-2xl, soft shadow, no hard borders
 * - Collapsed state: small pill button hugging the right edge
 * - Accent pink/primary highlights, light hover surfaces, almost no dividers
 */
export function CardLibrary({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { active, activeModule, toggleCardEnabled } = useTemplates();
  const [query, setQuery] = useState("");
  if (!open) return null;

  const cards = active.modules[activeModule].cards;
  const filtered = useMemo(
    () =>
      cards.filter(
        (c) => !query || c.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [cards, query],
  );
  const selectedCount = cards.filter((c) => c.enabled).length;

  const onDragStart = (e: DragEvent, cardId: string, disabled: boolean) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/x-card-id", cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "absolute right-3 top-1/2 z-30 flex h-24 w-7 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-l-xl rounded-r-md bg-card/95 py-3 text-[11px] font-medium text-foreground backdrop-blur-md",
          "shadow-[0_8px_24px_-10px_oklch(0.62_0.22_295/0.35)] ring-1 ring-primary/10 transition-all hover:w-8 hover:text-primary",
        )}
        title="展开计算任务卡"
      >
        <Workflow className="h-3.5 w-3.5 text-primary" />
        <span className="[writing-mode:vertical-rl] tracking-widest">任务卡</span>
        <span className="rounded-full bg-primary-soft px-1 text-[10px] font-semibold tabular-nums text-primary">
          {selectedCount}
        </span>
      </button>
    );
  }

  return (
    <aside
      className={cn(
        "absolute right-4 top-4 z-30 flex h-[calc(100%-2rem)] w-[280px] flex-col overflow-hidden rounded-2xl bg-card/95 backdrop-blur-md",
        "shadow-[0_20px_60px_-25px_oklch(0.62_0.22_295/0.35),0_4px_12px_-6px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="inline-flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground shadow-sm">
            <Workflow className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-[14px] font-semibold tracking-tight text-foreground">
              计算任务卡
            </div>
            <div className="text-[11px] text-muted-foreground">
              {moduleTitle[activeModule]} · 已选{" "}
              <span className="font-medium text-primary">{selectedCount}</span>
              <span className="opacity-60">/{cards.length}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="收起"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索卡片"
            className="h-8 w-full rounded-full bg-muted/60 pl-8 pr-3 text-[12.5px] text-foreground placeholder:text-muted-foreground/70 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-2 pb-2">
        {filtered.length === 0 ? (
          <div className="mt-8 px-3 text-center text-[12px] text-muted-foreground">
            没有匹配的卡片
          </div>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((card) => {
              const selected = card.enabled;
              return (
                <li
                  key={card.id}
                  draggable={!selected}
                  onDragStart={(e) => onDragStart(e, card.id, selected)}
                  className={cn(
                    "group flex items-center gap-2 rounded-xl px-2.5 py-2 transition-all",
                    selected
                      ? "cursor-not-allowed bg-primary-soft/60"
                      : "cursor-grab hover:bg-muted/70 active:cursor-grabbing",
                  )}
                >
                  <GripVertical
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-opacity",
                      selected
                        ? "text-primary/30"
                        : "text-muted-foreground/40 opacity-0 group-hover:opacity-100",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "truncate text-[12.5px] font-medium",
                        selected ? "text-primary" : "text-foreground",
                      )}
                    >
                      {card.title}
                    </div>
                    <div className="truncate text-[10.5px] text-muted-foreground">
                      {card.params.length} 参数
                      {card.params.some((p) => p.advanced) && " · 含高级"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCardEnabled(card.id)}
                    title={selected ? "已选择，点击移除" : "加入分栏页"}
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all",
                      selected
                        ? "bg-primary text-primary-foreground hover:bg-primary/85"
                        : "text-primary opacity-0 hover:bg-primary-soft group-hover:opacity-100",
                    )}
                  >
                    {selected ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 pt-1 text-[10.5px] leading-relaxed text-muted-foreground/80">
        拖拽卡片到分栏页，或点击 <Plus className="-mt-0.5 inline h-3 w-3 text-primary" /> 快速加入
      </div>
    </aside>
  );
}
