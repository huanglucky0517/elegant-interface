import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CloseButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-full px-5 text-[13px] font-medium text-primary-foreground",
        "bg-[image:var(--gradient-primary)] shadow-[var(--shadow-elegant)] transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-[0_10px_28px_-10px_oklch(0.62_0.22_295/0.55)] active:scale-[0.98]",
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
      <span>关闭</span>
    </button>
  );
}

export function AdvancedToggle({
  defaultOn = true,
  label = "高级设置",
}: {
  defaultOn?: boolean;
  label?: string;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-200",
        on
          ? "border-primary/30 bg-primary-soft text-primary shadow-[inset_0_0_0_1px_oklch(0.62_0.22_295/0.08)]"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
      )}
    >
      <span
        className={cn(
          "relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors",
          on ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-transform duration-200",
            on ? "translate-x-3.5" : "translate-x-0.5",
          )}
        />
      </span>
      {on ? `开启${label}` : `关闭${label}`}
    </button>
  );
}

export function TabPill({
  active,
  children,
  icon,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-card text-primary shadow-[var(--shadow-soft)] ring-1 ring-primary/20"
          : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
