import { useMemo, useState, type DragEvent } from "react";
import { ChevronLeft, ChevronRight, GripVertical, Plus, Search, Library } from "lucide-react";
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
  const inLibrary = useMemo(
    () =>
      cards
        .filter((c) => !c.enabled)
        .filter((c) => !query || c.title.toLowerCase().includes(query.toLowerCase())),
    [cards, query],
  );

  const onDragStart = (e: DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/x-card-id", cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  if (collapsed) {
    return (
      <aside className="flex w-11 shrink-0 flex-col items-center gap-3 border-r border-border bg-surface py-4">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-primary"
          title="展开卡片库"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Library className="h-4 w-4" />
        </div>
        <div className="rotate-180 [writing-mode:vertical-rl] text-[12px] font-medium tracking-widest text-muted-foreground">
          卡片库 · {inLibrary.length}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="inline-flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Library className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight text-foreground">卡片库</div>
            <div className="text-[10.5px] text-muted-foreground">{moduleTitle[activeModule]} · {inLibrary.length} 项可用</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-primary"
          title="折叠"
        >
          <ChevronLeft className="h-4 w-4" />
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
        {inLibrary.length === 0 ? (
          <div className="mt-6 px-3 text-center text-[12px] text-muted-foreground">
            没有可添加的卡片
            <div className="mt-1 text-[11px] text-muted-foreground/70">
              全部卡片已加入分栏页
            </div>
          </div>
        ) : (
          <ul className="space-y-1">
            {inLibrary.map((card) => (
              <li
                key={card.id}
                draggable
                onDragStart={(e) => onDragStart(e, card.id)}
                className={cn(
                  "group flex cursor-grab items-center gap-2 rounded-lg border border-transparent bg-card/60 px-2 py-2 transition-all",
                  "hover:border-primary/30 hover:bg-card hover:shadow-[var(--shadow-soft)] active:cursor-grabbing",
                )}
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 group-hover:text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium text-foreground">
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
                  title="加入分栏页"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary-soft"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border px-4 py-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
        提示：拖拽卡片到右侧分栏页，或点击 <Plus className="-mt-0.5 inline h-3 w-3" /> 快速加入
      </div>
    </aside>
  );
}
