import { ReactNode, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParamCardProps {
  title: string;
  enabled?: boolean;
  onToggle?: (v: boolean) => void;
  collapsible?: boolean;
  defaultOpen?: boolean;
  advancedLabel?: string;
  children?: ReactNode;
}

export function ParamCard({
  title,
  enabled = true,
  onToggle,
  collapsible = false,
  defaultOpen = true,
  advancedLabel = "高级设置",
  children,
}: ParamCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [on, setOn] = useState(enabled);

  const handleToggle = () => {
    const v = !on;
    setOn(v);
    onToggle?.(v);
  };

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card p-4 transition-[box-shadow,border-color,background] duration-200",
        on
          ? "border-border shadow-[var(--shadow-card)] hover:border-primary/30 hover:shadow-[var(--shadow-elegant)]"
          : "border-dashed border-border/70 bg-muted/30 opacity-70",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggle}
          aria-pressed={on}
          className={cn(
            "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors",
            on
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:border-primary/60",
          )}
        >
          {on && <Check className="h-3 w-3" strokeWidth={3} />}
        </button>
        <span className="text-[15px] font-medium tracking-tight text-foreground">{title}</span>
      </div>

      {children && (
        <div className="mt-3 space-y-2.5">
          {collapsible && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "group/adv inline-flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
                "text-primary/80 hover:bg-primary-soft hover:text-primary",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-1 w-1 rounded-full bg-current opacity-60" />
                {open ? `关闭${advancedLabel}` : `展开${advancedLabel}`}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  open ? "rotate-180" : "rotate-0",
                )}
              />
            </button>
          )}
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
              !collapsible || open
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <div className="space-y-2 pt-0.5">{children}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ParamRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1">
      <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        {label}
        {hint && (
          <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-muted-foreground/40 text-[9px] text-muted-foreground/70">
            ?
          </span>
        )}
      </span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

export function NumInput({ value }: { value: string | number }) {
  return (
    <input
      defaultValue={value}
      className="h-7 w-20 rounded-md border border-input bg-background px-2 text-right text-[13px] tabular-nums text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  );
}

export function YesNo({ defaultYes = false }: { defaultYes?: boolean }) {
  const [yes, setYes] = useState(defaultYes);
  return (
    <div className="inline-flex items-center gap-3 text-[12px]">
      <button
        type="button"
        onClick={() => setYes(true)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors",
          yes ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors",
            yes ? "border-primary" : "border-muted-foreground/50",
          )}
        >
          {yes && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </span>
        是
      </button>
      <button
        type="button"
        onClick={() => setYes(false)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors",
          !yes ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors",
            !yes ? "border-primary" : "border-muted-foreground/50",
          )}
        >
          {!yes && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </span>
        否
      </button>
    </div>
  );
}

export function MiniCheckbox({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [c, setC] = useState(defaultChecked);
  return (
    <button
      type="button"
      onClick={() => setC((v) => !v)}
      aria-pressed={c}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded border transition-colors",
        c
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:border-primary/60",
      )}
    >
      {c && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
    </button>
  );
}
