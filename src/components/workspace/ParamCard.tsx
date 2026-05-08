import { ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
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

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card p-4 transition-[box-shadow,border-color,background] duration-200",
        card.enabled
          ? "border-border shadow-[var(--shadow-card)] hover:border-primary/30 hover:shadow-[var(--shadow-elegant)]"
          : "border-dashed border-border/70 bg-muted/30 opacity-70",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleCardEnabled(card.id)}
          aria-pressed={card.enabled}
          className={cn(
            "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors",
            card.enabled
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:border-primary/60",
          )}
        >
          {card.enabled && <Check className="h-3 w-3" strokeWidth={3} />}
        </button>
        <span className="text-[15px] font-medium tracking-tight text-foreground">{card.title}</span>
        {hasAdvanced && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary">
            高级 {advParams.length}
          </span>
        )}
      </div>

      {card.enabled && (basicParams.length > 0 || hasAdvanced) && (
        <div className="mt-3 space-y-1">
          {basicParams.map((p) => (
            <ParamRow key={p.key} param={p} onChange={(v) => updateParam(card.id, p.key, v)} />
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
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-1 w-1 rounded-full bg-current opacity-60" />
                  {card.advancedOpen ? "关闭高级设置" : "展开高级设置"}
                </span>
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
                        onChange={(v) => updateParam(card.id, p.key, v)}
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
    <div className="flex items-center justify-between gap-3 px-1 py-1">
      <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        {param.label}
        {param.hint && (
          <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-muted-foreground/40 text-[9px] text-muted-foreground/70">
            ?
          </span>
        )}
      </span>
      <div className="flex items-center">
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
          className="h-7 w-24 rounded-md border border-input bg-background px-2 text-right text-[13px] tabular-nums text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          className="h-7 w-28 rounded-md border border-input bg-background px-2 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
    className="h-7 w-20 rounded-md border border-input bg-background px-2 text-right text-[13px] tabular-nums"
  />
);
export const ParamRowLegacy = (_: { label: string; hint?: boolean; children: ReactNode }) => null;
