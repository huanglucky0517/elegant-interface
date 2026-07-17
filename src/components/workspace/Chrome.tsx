import { ChevronDown, HelpCircle, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function TopBar() {
  const navRight = [
    { label: "价格", icon: <span className="text-primary">◆</span>, to: undefined as string | undefined },
    { label: "产品库", to: "/products" },
    { label: "online模型", to: undefined },
  ];
  const stores = ["机壳库", "材料库"];

  return (
    <header className="flex h-14 items-center gap-6 border-b border-border bg-card/80 px-6 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
          <span className="text-[11px] font-bold">数智</span>
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight">数智工程师</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Virtual Engineer
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <span>无人机领域</span>
        <span className="text-border">/</span>
        <span>交流永磁同步电动机</span>
        <button className="ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-muted">
          未命名 <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {navRight.map((n) => (
          <button
            key={n.label}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
          >
            {n.icon}
            {n.label}
          </button>
        ))}
        <span className="mx-2 h-5 w-px bg-border" />
        {stores.map((s) => (
          <button
            key={s}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] text-foreground/80 transition-colors hover:bg-muted"
          >
            {s} <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        ))}
        <button className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button className="ml-1 flex h-8 items-center gap-1 rounded-full bg-muted px-1 pr-2 text-[12px]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
            <User className="h-3.5 w-3.5" />
          </span>
          顾 <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </div>
    </header>
  );
}

export function LeftNav() {
  const items = [
    { label: "电动车领域参数", active: false, group: "top" },
    { label: "机壳参数", active: false, group: "top" },
    { label: "基本需求", icon: "◇", active: false },
    { label: "约束条件", icon: "≋", active: false },
    { label: "指定冲片", icon: "▤", active: false },
    { label: "初始方案", icon: "⚡", active: true },
    { label: "优化设计", icon: "◷", active: false },
  ];

  return (
    <aside className="flex w-[180px] shrink-0 flex-col gap-1 border-r border-border bg-surface px-3 py-5">
      <div className="space-y-1">
        {items
          .filter((i) => i.group === "top")
          .map((i) => (
            <button
              key={i.label}
              className="w-full rounded-md px-3 py-2 text-left text-[13px] text-muted-foreground hover:bg-card hover:text-foreground"
            >
              {i.label}
            </button>
          ))}
      </div>
      <div className="my-2 h-px bg-border" />
      <div className="space-y-0.5">
        {items
          .filter((i) => !i.group)
          .map((i) => (
            <button
              key={i.label}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition-colors",
                i.active
                  ? "bg-primary-soft text-primary font-medium"
                  : "text-foreground/70 hover:bg-card hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "text-[14px]",
                  i.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {i.icon}
              </span>
              {i.label}
            </button>
          ))}
      </div>
    </aside>
  );
}
