import { useMemo, useState } from "react";
import { ChevronLeft, LayoutGrid, List, X, Check, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchCondition, MatchedProduct } from "@/hooks/use-match-history";

const CANDIDATES: MatchedProduct[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `c${i + 1}`,
  name: `quanshun_auto1_电动摩托车_交流永磁同步_${i + 1}`,
  motorType: "圆形带散热翅中置电机",
  domain: "电动摩托车",
  power: (7.75 + i * 0.006).toFixed(5),
  speed: "5271.88",
  torque: (14.04 + i * 0.008).toFixed(4),
  efficiency: (91.57 + i * 0.004).toFixed(4),
  insulation: "H 180℃",
}));

export function ProductMatchPanel({
  open,
  onClose,
  onBack,
  conditions,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  conditions: MatchCondition[];
  onConfirm: (product: MatchedProduct | null, conditions: MatchCondition[]) => void;
}) {
  const [view, setView] = useState<"card" | "list">("card");
  const [enabled, setEnabled] = useState<Set<string>>(new Set(conditions.map((c) => c.label)));
  const [tol, setTol] = useState<MatchCondition[]>(conditions);
  const [picked, setPicked] = useState<string | null>(null);

  const activeConditions = useMemo(() => tol.filter((c) => enabled.has(c.label)), [tol, enabled]);
  const results = activeConditions.length === 0 ? [] : CANDIDATES;

  if (!open) return null;

  const toggle = (label: string) =>
    setEnabled((s) => {
      const n = new Set(s);
      if (n.has(label)) n.delete(label);
      else n.add(label);
      return n;
    });

  const setTolField = (label: string, key: "tolMin" | "tolMax", value: string) =>
    setTol((t) => t.map((c) => (c.label === label ? { ...c, [key]: value } : c)));

  const confirm = () => {
    const product = results.find((r) => r.id === picked) ?? null;
    onConfirm(product, activeConditions);
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-foreground/25 backdrop-blur-[1px]">
      <section className="flex h-full w-[86vw] max-w-[1180px] flex-col bg-background shadow-[0_0_48px_rgba(0,0,0,0.2)]">
        <header className="flex shrink-0 items-start justify-between border-b border-border px-5 py-3">
          <button onClick={onBack} className="flex items-start gap-1.5 text-left">
            <ChevronLeft className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>
              <span className="block text-[15px] font-semibold text-foreground">产品匹配</span>
              <span className="block text-[11.5px] text-muted-foreground">选择匹配需求的电机进行设计</span>
            </span>
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* results */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between px-5 py-3">
              <h3 className="text-[13.5px] font-semibold text-foreground">匹配结果</h3>
              <div className="inline-flex items-center rounded-md border border-border bg-background p-0.5">
                <button
                  onClick={() => setView("card")}
                  className={cn(
                    "flex h-6 w-7 items-center justify-center rounded",
                    view === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "flex h-6 w-7 items-center justify-center rounded",
                    view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-5 pb-20">
              {results.length === 0 ? (
                <div className="flex h-[320px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground">
                  <SearchX className="h-7 w-7" />
                  <span className="text-[13px]">未匹配到结果，请调整匹配条件</span>
                </div>
              ) : view === "card" ? (
                <div className="grid grid-cols-2 gap-4">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPicked(p.id)}
                      className={cn(
                        "rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/40",
                        picked === p.id ? "border-primary ring-2 ring-primary/25" : "border-border",
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-[10px] font-semibold text-primary">
                          电机
                        </div>
                        <div className="min-w-0 leading-tight">
                          <div className="truncate text-[12.5px] font-medium text-foreground">{p.motorType}</div>
                          <div className="text-[11.5px] text-muted-foreground">{p.domain}</div>
                        </div>
                        {picked === p.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                      </div>
                      <div className="mt-2.5 truncate text-[13px] font-semibold text-foreground">{p.name}</div>
                      <dl className="mt-3 space-y-1 rounded-lg bg-surface px-3 py-2 text-[11.5px]">
                        <Row k="额定功率(kW)" v={p.power} />
                        <Row k="额定转速(rpm)" v={p.speed} />
                        <Row k="额定转矩(Nm)" v={p.torque} />
                        <Row k="额定效率(%)" v={p.efficiency} />
                        <Row k="绝缘等级" v={p.insulation} />
                      </dl>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full border-collapse text-[12.5px]">
                    <thead>
                      <tr className="bg-primary-soft/60 text-left font-semibold text-foreground">
                        <th className="w-10 px-3 py-2" />
                        <th className="px-3 py-2">产品名称</th>
                        <th className="px-3 py-2">额定功率(kW)</th>
                        <th className="px-3 py-2">额定转速(rpm)</th>
                        <th className="px-3 py-2">额定转矩(Nm)</th>
                        <th className="px-3 py-2">额定效率(%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((p) => (
                        <tr
                          key={p.id}
                          onClick={() => setPicked(p.id)}
                          className={cn(
                            "cursor-pointer border-t border-border/60 bg-card hover:bg-primary-soft/30",
                            picked === p.id && "bg-primary-soft/50",
                          )}
                        >
                          <td className="px-3 py-2">
                            <input type="radio" readOnly checked={picked === p.id} className="h-3.5 w-3.5 accent-primary" />
                          </td>
                          <td className="max-w-[260px] truncate px-3 py-2 font-medium">{p.name}</td>
                          <td className="px-3 py-2 tabular-nums">{p.power}</td>
                          <td className="px-3 py-2 tabular-nums">{p.speed}</td>
                          <td className="px-3 py-2 tabular-nums">{p.torque}</td>
                          <td className="px-3 py-2 tabular-nums">{p.efficiency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* conditions */}
          <aside className="flex w-[260px] shrink-0 flex-col border-l border-border bg-surface">
            <div className="border-b border-border px-4 py-3 text-[12.5px] font-semibold text-foreground">匹配条件</div>
            <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 py-3">
              {tol.map((c) => (
                <div key={c.label} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[12.5px] font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={enabled.has(c.label)}
                      onChange={() => toggle(c.label)}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                    {c.label}
                  </label>
                  <div className="pl-5 text-[11.5px] text-muted-foreground">{c.value}</div>
                  <div className="flex items-center gap-1.5 pl-5">
                    <span className="text-[11.5px] text-muted-foreground">容差(%)</span>
                    <input
                      value={c.tolMin}
                      onChange={(e) => setTolField(c.label, "tolMin", e.target.value)}
                      className="h-7 w-[52px] rounded border border-input bg-background px-2 text-[12px] focus:border-primary focus:outline-none"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      value={c.tolMax}
                      onChange={(e) => setTolField(c.label, "tolMax", e.target.value)}
                      className="h-7 w-[52px] rounded border border-input bg-background px-2 text-[12px] focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3">
          <button
            onClick={onBack}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-[12.5px] text-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> 返回上一步
          </button>
          <button
            onClick={confirm}
            className="inline-flex h-8 items-center rounded-md bg-[image:var(--gradient-primary)] px-4 text-[12.5px] font-semibold text-primary-foreground"
          >
            {picked ? "选为本次匹配结果" : "记录未匹配结果"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="tabular-nums text-foreground">{v}</dd>
    </div>
  );
}
