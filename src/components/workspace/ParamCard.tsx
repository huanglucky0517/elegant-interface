import { ReactNode } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Card as CardModel, Param } from "./templates/types";
import { useTemplates } from "./templates/store";

interface ParamCardProps {
  card: CardModel;
}

export function ParamCard({ card }: ParamCardProps) {
  const { toggleCardEnabled, toggleCardAdvanced, updateParam } = useTemplates();
  const basicParams = card.params.filter((p) => !p.advanced);
  const advParams = card.params.filter((p) => p.advanced);
  const hasAdvanced = advParams.length > 0;

  // Checkbox group: among params of type "checkbox" in the card, at least one must remain selected.
  const checkboxKeys = card.params.filter((p) => p.type === "checkbox").map((p) => p.key);
  const handleParamChange = (p: Param, v: Param["value"]) => {
    if (p.type === "checkbox" && checkboxKeys.length > 0 && v === false) {
      const stillChecked = card.params.filter(
        (q) => q.type === "checkbox" && q.key !== p.key && q.value === true,
      ).length;
      if (stillChecked === 0) {
        toast.warning("至少保留一个选项", {
          description: `「${card.title}」必须选择至少一个计算项。`,
        });
        return;
      }
    }
    updateParam(card.id, p.key, v);
  };

  return (
    <div
      className={cn(
        "group rounded-2xl bg-card p-4 transition-[box-shadow,transform] duration-200",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-10px_oklch(0.62_0.22_295/0.25)]",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex-1 truncate whitespace-nowrap text-[15px] font-medium tracking-tight text-foreground">
          {card.title}
        </span>
        <button
          type="button"
          onClick={() => toggleCardEnabled(card.id)}
          title="释放回卡片库"
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-all",
            "opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive",
          )}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>

      {(basicParams.length > 0 || hasAdvanced) && (
        <div className="mt-3 space-y-1">
          {basicParams.map((p) => (
            <ParamRow key={p.key} param={p} onChange={(v) => handleParamChange(p, v)} />
          ))}

          {hasAdvanced && (
            <>
              <button
                type="button"
                onClick={() => toggleCardAdvanced(card.id)}
                className={cn(
                  "mt-2 inline-flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
                  "text-primary/80 hover:bg-primary-soft hover:text-primary",
                )}
              >
                <span>{card.advancedOpen ? "关闭高级设置" : "展开高级设置"}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    card.advancedOpen ? "rotate-180" : "rotate-0",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                  card.advancedOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="space-y-1 rounded-lg bg-primary-soft/40 p-2">
                    {advParams.map((p) => (
                      <ParamRow
                        key={p.key}
                        param={p}
                        onChange={(v) => handleParamChange(p, v)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ParamRow({ param, onChange }: { param: Param; onChange: (v: Param["value"]) => void }) {
  return (
    <div className="flex items-start justify-between gap-3 px-1 py-1">
      <span className="flex min-w-0 flex-1 items-start gap-1 text-[13px] leading-snug text-muted-foreground">
        <span className="line-clamp-2 break-words">{param.label}</span>
        {param.hint && (
          <span className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/40 text-[9px] text-muted-foreground/70">
            ?
          </span>
        )}
      </span>
      <div className="flex shrink-0 items-center pt-0.5">
        <ParamInput param={param} onChange={onChange} />
      </div>
    </div>
  );
}

function ParamInput({ param, onChange }: { param: Param; onChange: (v: Param["value"]) => void }) {
  switch (param.type) {
    case "num":
      return (
        <input
          type="number"
          value={param.value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-7 w-24 rounded-md border border-input bg-background pl-2 pr-1 text-right text-[13px] tabular-nums text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      );
    case "yesno":
      return <YesNo value={param.value as boolean} onChange={onChange} />;
    case "checkbox":
      return <MiniCheckbox value={param.value as boolean} onChange={onChange} />;
    case "select":
      return (
        <select
          value={param.value as string}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-28 rounded-md border border-input bg-background pl-2 pr-1 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {(param.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "tags": {
      const arr = (param.value as string[]) ?? [];
      const first = arr[0];
      const more = arr.length - 1;
      return (
        <div className="inline-flex h-7 items-center gap-1 rounded-md border border-input bg-background px-2 text-[12px]">
          {first && (
            <span className="inline-flex items-center gap-1 rounded bg-primary-soft px-1.5 text-primary">
              {first} ✕
            </span>
          )}
          {more > 0 && <span className="text-muted-foreground">+{more}</span>}
        </div>
      );
    }
  }
}

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inline-flex items-center gap-3 text-[12px]">
      {[
        { v: true, label: "是" },
        { v: false, label: "否" },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            "inline-flex items-center gap-1 transition-colors",
            value === o.v ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span
            className={cn(
              "flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors",
              value === o.v ? "border-primary" : "border-muted-foreground/50",
            )}
          >
            {value === o.v && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function MiniCheckbox({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded border transition-colors",
        value
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:border-primary/60",
      )}
    >
      {value && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
    </button>
  );
}

// Legacy named exports kept so existing imports don't break (e.g. types/tests).
export const NumInput = ({ value }: { value: string | number }) => (
  <input
    defaultValue={value}
    className="h-7 w-20 rounded-md border border-input bg-background pl-2 pr-1 text-right text-[13px] tabular-nums"
  />
);
export const ParamRowLegacy = (_: { label: string; hint?: boolean; children: ReactNode }) => null;
