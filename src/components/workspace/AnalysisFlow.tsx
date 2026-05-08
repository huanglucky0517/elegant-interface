import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTemplates } from "./templates/store";
import { TemplateBar } from "./TemplateBar";
import type { ModuleKey } from "./templates/types";

interface FlowItem {
  key: ModuleKey;
  label: string;
  color: string;
  icon: React.ReactNode;
}

const flow: FlowItem[] = [
  { key: "em", label: "电磁性能", color: "oklch(0.62 0.22 295)", icon: <span className="text-sm">📈</span> },
  { key: "thermal", label: "温升", color: "oklch(0.7 0.18 230)", icon: <span className="text-sm">🌡️</span> },
  { key: "stress", label: "应力", color: "oklch(0.7 0.16 160)", icon: <span className="text-sm">⬇️</span> },
  { key: "nvh", label: "振动噪音", color: "oklch(0.7 0.18 40)", icon: <span className="text-sm">🔊</span> },
];

const files = [
  { label: "工艺文件", progress: "0/2", color: "oklch(0.65 0.16 220)" },
  { label: "绕线图", progress: "0/1", color: "oklch(0.65 0.18 295)" },
  { label: "图纸", progress: "0/3", color: "oklch(0.7 0.16 200)" },
  { label: "BOM表", progress: "0/2", color: "oklch(0.7 0.16 25)" },
];

export function AnalysisFlow() {
  const { active, activeModule, setActiveModule } = useTemplates();

  return (
    <aside className="flex w-[280px] shrink-0 flex-col gap-6 border-l border-border bg-surface px-5 py-6">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">分析流程</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">
          选择初始方案设计需要分析的流程
        </p>

        <ul className="mt-4 space-y-1">
          {flow.map((item) => {
            const cards = active.modules[item.key].cards;
            const enabled = cards.filter((c) => c.enabled).length;
            const isActive = activeModule === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => setActiveModule(item.key)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                    isActive
                      ? "bg-card shadow-[var(--shadow-soft)] ring-1 ring-primary/15"
                      : "hover:bg-card/70",
                  )}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{ background: `color-mix(in oklab, ${item.color} 14%, transparent)` }}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 text-[13px] font-medium text-foreground">{item.label}</span>
                  <span className="text-[12px] tabular-nums text-muted-foreground">
                    {enabled}/{cards.length}
                  </span>
                  {cards.length > 0 ? (
                    <Check
                      className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-emerald-500")}
                      strokeWidth={3}
                    />
                  ) : (
                    <span className="text-[11px] font-medium text-primary opacity-80">空</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">结果文件</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">
          全流程设计时需要进行以下文件的选择
        </p>
        <ul className="mt-4 space-y-1">
          {files.map((f) => (
            <li
              key={f.label}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-card/70"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{ background: `color-mix(in oklab, ${f.color} 14%, transparent)` }}
              >
                <Circle className="h-3 w-3" style={{ color: f.color }} fill="currentColor" />
              </span>
              <span className="flex-1 text-[13px] font-medium text-foreground">{f.label}</span>
              <span className="text-[12px] tabular-nums text-muted-foreground">{f.progress}</span>
              <span className="text-[11px] font-medium text-primary">选择</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="mt-auto inline-flex h-11 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-[14px] font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:scale-[1.01] active:scale-[0.99]">
        初始方案设计
      </button>
    </aside>
  );
}
