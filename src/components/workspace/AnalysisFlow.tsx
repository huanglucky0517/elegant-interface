import { useState } from "react";
import { Check, Circle, Save, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTemplates } from "./templates/store";
import { TemplateBar } from "./TemplateBar";
import { DOMAINS, MOTOR_TYPES } from "./templates/types";
import type { Domain, ModuleKey, MotorType } from "./templates/types";

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
  const { active, activeModule, setActiveModule, saveAsTemplate } = useTemplates();
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDomain, setSaveDomain] = useState<Domain>("通用");
  const [saveMotor, setSaveMotor] = useState<MotorType>("永磁同步");

  const openSave = () => {
    setSaveName(`${active.name} 副本`);
    setSaveDomain("通用");
    setSaveMotor("永磁同步");
    setSaveOpen(true);
  };
  const confirmSave = () => {
    const name = saveName.trim();
    if (!name) return;
    saveAsTemplate(name, saveDomain, saveMotor);
    setSaveOpen(false);
    toast.success(`已保存模板「${name}」`);
  };

  return (
    <aside className="flex w-[280px] shrink-0 flex-col gap-6 border-l border-border bg-surface px-5 py-6">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">分析流程</h3>
          <button
            onClick={openSave}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-primary transition-colors hover:bg-primary-soft"
            title="保存为模板"
          >
            <Save className="h-3.5 w-3.5" /> 保存为模板
          </button>
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">
          选择模板并配置需要分析的流程
        </p>

        <div className="mt-3">
          <TemplateBar />
        </div>

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

      {saveOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSaveOpen(false)}
        >
          <div
            className="w-[400px] rounded-xl border border-border bg-popover p-4 shadow-[var(--shadow-elegant)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[14px] font-semibold text-foreground">保存为模板</h4>
              <button onClick={() => setSaveOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="mb-1.5 block text-[12px] text-muted-foreground">模板名称</label>
            <input
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmSave();
                if (e.key === "Escape") setSaveOpen(false);
              }}
              placeholder="请输入模板名称"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[12px] text-muted-foreground">应用领域</label>
                <select
                  value={saveDomain}
                  onChange={(e) => setSaveDomain(e.target.value as Domain)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] text-muted-foreground">电机类型</label>
                <select
                  value={saveMotor}
                  onChange={(e) => setSaveMotor(e.target.value as MotorType)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {MOTOR_TYPES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setSaveOpen(false)}
                className="inline-flex h-8 items-center rounded-md border border-border px-3 text-[12px] text-foreground/80 hover:bg-muted"
              >
                取消
              </button>
              <button
                onClick={confirmSave}
                disabled={!saveName.trim()}
                className="inline-flex h-8 items-center rounded-md bg-primary px-4 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
