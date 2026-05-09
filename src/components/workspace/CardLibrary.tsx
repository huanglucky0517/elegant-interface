import { useMemo, useState, type DragEvent } from "react";
import { ChevronLeft, ChevronRight, GripVertical, Plus, Check, Search, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTemplates } from "./templates/store";
import type { ModuleKey } from "./templates/types";

const moduleTitle: Record<ModuleKey, string> = {
  em: "电磁性能",
  thermal: "温升",
  stress: "应力",
  nvh: "振动噪音",
};

export function CardLibrary() {
  const { active, activeModule, toggleCardEnabled } = useTemplates();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

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

  if (collapsed) {
    return (
      <aside className="flex w-11 shrink-0 flex-col items-center gap-3 border-l border-border bg-surface py-4">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-primary"
          title="展开分析流程"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Workflow className="h-4 w-4" />
        </div>
        <div className="rotate-180 [writing-mode:vertical-rl] text-[12px] font-medium tracking-widest text-muted-foreground">
          分析流程 · {selectedCount}/{cards.length}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-l border-border bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="inline-flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Workflow className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight text-foreground">计算任务卡</div>
            <div className="text-[10.5px] text-muted-foreground">
              {moduleTitle[activeModule]} · 已选 {selectedCount}/{cards.length}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-primary"
          title="折叠"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索卡片"
            className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-2 text-[12.5px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-2 flex-1 overflow-auto px-2 pb-3">
        {filtered.length === 0 ? (
          <div className="mt-6 px-3 text-center text-[12px] text-muted-foreground">
            没有匹配的卡片
          </div>
        ) : (
          <ul className="space-y-1">
            {filtered.map((card) => {
              const selected = card.enabled;
              return (
                <li
                  key={card.id}
                  draggable={!selected}
                  onDragStart={(e) => onDragStart(e, card.id, selected)}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg border px-2 py-2 transition-all",
                    selected
                      ? "cursor-not-allowed border-primary/30 bg-primary-soft/50"
                      : "cursor-grab border-transparent bg-card/60 hover:border-primary/30 hover:bg-card hover:shadow-[var(--shadow-soft)] active:cursor-grabbing",
                  )}
                >
                  <GripVertical
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      selected
                        ? "text-primary/30"
                        : "text-muted-foreground/60 group-hover:text-primary",
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
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-primary hover:bg-primary-soft",
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

      <div className="border-t border-border px-4 py-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
        提示：拖拽未选中的卡片到分栏页，或点击 <Plus className="-mt-0.5 inline h-3 w-3" /> 快速加入；点击 <Check className="-mt-0.5 inline h-3 w-3" /> 移除已选卡片
      </div>
    </aside>
  );
}
