import { useState } from "react";
import { X, LineChart } from "lucide-react";
import curveImg from "@/assets/perf-curve.jpg";
import { cn } from "@/lib/utils";

export interface WorkCondition {
  key: string;
  label: string;
  fields: { key: string; label: string; value: string; unit?: string }[];
}

export const DEFAULT_CONDITIONS: WorkCondition[] = [
  {
    key: "climb",
    label: "爬坡工况",
    fields: [
      { key: "grade", label: "坡度", value: "20", unit: "%" },
      { key: "speed", label: "车速", value: "15", unit: "km/h" },
      { key: "mass", label: "整车质量", value: "180", unit: "kg" },
    ],
  },
  {
    key: "top",
    label: "极速工况",
    fields: [
      { key: "vmax", label: "最高车速", value: "80", unit: "km/h" },
      { key: "cd", label: "风阻系数", value: "0.6" },
      { key: "area", label: "迎风面积", value: "0.6", unit: "m²" },
    ],
  },
  {
    key: "peak",
    label: "输出相电流峰值",
    fields: [
      { key: "ipk", label: "控制器相电流峰值", value: "647", unit: "A" },
      { key: "udc", label: "母线电压", value: "72", unit: "V" },
    ],
  },
];

export interface ConvertedMetric {
  condition: string;
  torque: string;
  speed: string;
  power: string;
  current: string;
}

export function DomainParamsPanel({
  open,
  onClose,
  conditions,
  onChange,
  metrics,
  onConvert,
  onMatch,
}: {
  open: boolean;
  onClose: () => void;
  conditions: WorkCondition[];
  onChange: (conditions: WorkCondition[]) => void;
  metrics: ConvertedMetric[] | null;
  onConvert: () => void;
  onMatch: () => void;
}) {
  const [active, setActive] = useState(conditions[0]?.key ?? "");

  const setField = (ck: string, fk: string, value: string) => {
    onChange(
      conditions.map((c) =>
        c.key === ck ? { ...c, fields: c.fields.map((f) => (f.key === fk ? { ...f, value } : f)) } : c,
      ),
    );
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[1px]" onClick={onClose} />}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-screen w-[760px] max-w-[92vw] flex-col bg-background shadow-[0_0_40px_rgba(0,0,0,0.18)] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex shrink-0 items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">应用领域参数设置</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">设置整车工况参数，转换为电机性能指标</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <nav className="w-[150px] shrink-0 border-r border-border bg-surface p-3">
            {conditions.map((c) => (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={cn(
                  "mb-1 block w-full rounded-md px-3 py-2 text-left text-[12.5px] transition-colors",
                  active === c.key ? "bg-primary-soft font-semibold text-primary" : "text-foreground/75 hover:bg-card",
                )}
              >
                {c.label}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 overflow-auto px-6 py-5">
            {conditions
              .filter((c) => c.key === active)
              .map((c) => (
                <div key={c.key} className="space-y-3">
                  <div className="text-[13px] font-semibold text-foreground">{c.label}</div>
                  <div className="grid grid-cols-2 gap-3">
                    {c.fields.map((f) => (
                      <label key={f.key} className="block">
                        <span className="mb-1 block text-[12px] text-muted-foreground">
                          {f.label}
                          {f.unit ? `（${f.unit}）` : ""}
                        </span>
                        <input
                          value={f.value}
                          onChange={(e) => setField(c.key, f.key, e.target.value)}
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}

            {metrics && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-border bg-card p-3">
                  <div className="mb-2 text-[12.5px] font-semibold text-foreground">性能曲线</div>
                  <img
                    src={curveImg}
                    alt="电机转矩-转速与效率曲线"
                    loading="lazy"
                    width={1088}
                    height={608}
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full border-collapse text-[12.5px]">
                    <thead>
                      <tr className="bg-primary-soft/60 text-left font-semibold text-foreground">
                        <th className="px-3 py-2">工况</th>
                        <th className="px-3 py-2">输出转矩(Nm)</th>
                        <th className="px-3 py-2">电机转速(rpm)</th>
                        <th className="px-3 py-2">功率(kW)</th>
                        <th className="px-3 py-2">相电流(A)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((m) => (
                        <tr key={m.condition} className="border-t border-border/60 bg-card">
                          <td className="px-3 py-2 font-medium">{m.condition}</td>
                          <td className="px-3 py-2 tabular-nums">{m.torque}</td>
                          <td className="px-3 py-2 tabular-nums">{m.speed}</td>
                          <td className="px-3 py-2 tabular-nums">{m.power}</td>
                          <td className="px-3 py-2 tabular-nums">{m.current}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-3">
          <button
            onClick={onConvert}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/30 bg-primary-soft px-3 text-[12.5px] font-semibold text-primary hover:bg-primary/10"
          >
            <LineChart className="h-3.5 w-3.5" /> 指标转换
          </button>
          <button
            onClick={onMatch}
            disabled={!metrics}
            className="inline-flex h-8 items-center rounded-md bg-[image:var(--gradient-primary)] px-4 text-[12.5px] font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            产品匹配
          </button>
        </footer>
      </aside>
    </>
  );
}
