import { SearchX, Trash2 } from "lucide-react";
import type { MatchRecord } from "@/hooks/use-match-history";

export function MatchRecords({
  records,
  onRemove,
}: {
  records: MatchRecord[];
  onRemove: (id: string) => void;
}) {
  if (records.length === 0) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground">
        <SearchX className="h-7 w-7" />
        <span className="text-[13px]">暂无匹配结果记录，请在「设计产品」流程中完成一次产品匹配</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((r) => (
        <article key={r.id} className="rounded-xl border border-border bg-card p-4">
          <header className="flex items-start justify-between">
            <div>
              <div className="text-[13.5px] font-semibold text-foreground">
                {r.domain} · {r.motorType}
              </div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">匹配时间：{r.createdAt}</div>
            </div>
            <button
              onClick={() => onRemove(r.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              title="删除记录"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </header>

          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-surface p-3">
              <div className="mb-1.5 text-[12px] font-semibold text-foreground">匹配条件</div>
              <ul className="space-y-1 text-[11.5px] text-muted-foreground">
                {r.conditions.map((c) => (
                  <li key={c.label}>
                    <span className="text-foreground/80">{c.label}：</span>
                    {c.value}（容差 {c.tolMin}–{c.tolMax}%）
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-surface p-3">
              <div className="mb-1.5 text-[12px] font-semibold text-foreground">匹配产品</div>
              {r.product ? (
                <div className="space-y-1 text-[11.5px]">
                  <div className="text-[12.5px] font-medium text-foreground">{r.product.name}</div>
                  <div className="text-muted-foreground">
                    额定功率 {r.product.power} kW · 额定转速 {r.product.speed} rpm · 额定转矩 {r.product.torque} Nm
                  </div>
                  <div className="text-muted-foreground">
                    额定效率 {r.product.efficiency}% · 绝缘等级 {r.product.insulation}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[12px] text-rose-600">
                  <SearchX className="h-3.5 w-3.5" /> 未匹配到结果
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
