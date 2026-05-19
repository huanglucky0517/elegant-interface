import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Check, X, LayoutGrid, Search, AlertTriangle, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTemplates } from "./templates/store";
import { DOMAINS } from "./templates/types";
import type { Domain } from "./templates/types";

const _unusedDomainColor: Record<Domain, string> = {
  通用: "oklch(0.7 0.04 260)",
  工业驱动: "oklch(0.62 0.18 230)",
  新能源汽车: "oklch(0.62 0.22 295)",
  家用电器: "oklch(0.7 0.16 40)",
  航空航天: "oklch(0.62 0.16 160)",
};

const POPUP_W = 460;
const POPUP_H = 520;

export function TemplateBar() {
  const { templates, appliedId, applyTemplate, rename, remove } = useTemplates();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(appliedId);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<Domain | "全部">("全部");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  // Compute initial position when opening, clamped to viewport
  useLayoutEffect(() => {
    if (!open) return;
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const margin = 8;
    const w = popRef.current?.offsetWidth ?? POPUP_W;
    const h = popRef.current?.offsetHeight ?? POPUP_H;
    let x = r.left;
    let y = r.bottom + 6;
    x = Math.min(Math.max(margin, x), window.innerWidth - w - margin);
    y = Math.min(Math.max(margin, y), window.innerHeight - h - margin);
    setPos({ x, y });
  }, [open]);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Drag handlers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !popRef.current) return;
      const w = popRef.current.offsetWidth;
      const h = popRef.current.offsetHeight;
      const margin = 4;
      let x = e.clientX - dragRef.current.dx;
      let y = e.clientY - dragRef.current.dy;
      x = Math.min(Math.max(margin, x), window.innerWidth - w - margin);
      y = Math.min(Math.max(margin, y), window.innerHeight - h - margin);
      setPos({ x, y });
    };
    const onUp = () => {
      dragRef.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    if (!popRef.current) return;
    const r = popRef.current.getBoundingClientRect();
    dragRef.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    document.body.style.userSelect = "none";
  };

  const startRename = (id: string, current: string) => {
    setRenaming(id);
    setDraftName(current);
  };
  const commitRename = () => {
    if (renaming && draftName.trim()) rename(renaming, draftName.trim());
    setRenaming(null);
  };

  const openPicker = () => {
    setPendingId(appliedId);
    setOpen((v) => !v);
  };

  const confirmApply = () => {
    if (pendingId) {
      applyTemplate(pendingId);
      const tpl = templates.find((t) => t.id === pendingId);
      toast.success(`已应用模板「${tpl?.name ?? ""}」`);
    }
    setOpen(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates
      .filter(
        (t) =>
          (domainFilter === "全部" || t.domain === domainFilter) &&
          (!q || t.name.toLowerCase().includes(q) || t.motorType.toLowerCase().includes(q)),
      )
      .slice()
      .sort((a, b) => {
        const ua = a.usageCount ?? 0;
        const ub = b.usageCount ?? 0;
        if (ub !== ua) return ub - ua;
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      });
  }, [templates, query, domainFilter]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-primary transition-colors hover:text-primary/80"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span className="underline-offset-4 group-hover:underline">选择模板</span>
      </button>

      {open && (
        <div
          ref={popRef}
          style={{
            position: "fixed",
            left: pos?.x ?? -9999,
            top: pos?.y ?? -9999,
            width: POPUP_W,
            visibility: pos ? "visible" : "hidden",
          }}
          className="z-50 rounded-2xl border border-border/60 bg-popover p-0 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
        >
          {/* Header (drag handle) */}
          <div
            onMouseDown={startDrag}
            className="flex cursor-move items-center justify-between border-b border-border/60 px-4 py-3 select-none"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60" />
              <LayoutGrid className="h-4 w-4 text-primary" />
              <h4 className="text-[14px] font-semibold text-foreground">模板库</h4>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] tabular-nums text-muted-foreground">
                {templates.length}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pt-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索模板名称 / 电机类型"
                className="h-8 w-full rounded-full border border-border bg-background pl-8 pr-3 text-[12.5px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          {/* Domain tabs */}
          <div className="flex items-center gap-1 overflow-x-auto px-4 py-2.5">
            {(["全部", ...DOMAINS] as const).map((d) => {
              const isOn = domainFilter === d;
              return (
                <button
                  key={d}
                  onClick={() => setDomainFilter(d)}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                    isOn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Card grid */}
          <div className="max-h-[340px] overflow-auto px-4 pb-3">
            {filtered.length === 0 ? (
              <div className="flex h-24 items-center justify-center text-[12px] text-muted-foreground">
                未找到匹配模板
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {filtered.map((t) => {
                  const isPending = t.id === pendingId;
                  const isRenaming = renaming === t.id;
                  const dColor = domainColor[t.domain];
                  return (
                    <div
                      key={t.id}
                      role="button"
                      onClick={() => !isRenaming && setPendingId(t.id)}
                      className={cn(
                        "group relative cursor-pointer rounded-xl border bg-card p-3 transition-all",
                        isPending
                          ? "border-primary shadow-[0_4px_14px_-4px_rgba(99,102,241,0.35)] ring-2 ring-primary/30"
                          : "border-border/60 hover:border-primary/40 hover:shadow-sm",
                      )}
                    >
                      {/* Header row: 32x32 icon top-left */}
                      <div className="mb-2 flex items-start gap-2">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                          style={{
                            background: `color-mix(in oklab, ${dColor} 14%, transparent)`,
                          }}
                        >
                          <FileText className="h-4 w-4" style={{ color: dColor }} />
                        </div>
                      </div>

                      {/* Name */}
                      {isRenaming ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            value={draftName}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setDraftName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRename();
                              if (e.key === "Escape") setRenaming(null);
                            }}
                            className="h-6 w-full rounded border border-input bg-background pl-1.5 pr-1 text-[12px] focus:border-primary focus:outline-none"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              commitRename();
                            }}
                            className="text-primary"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="truncate text-[12.5px] font-medium text-foreground" title={t.name}>
                          {t.name}
                        </div>
                      )}

                      {/* Tags */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            background: `color-mix(in oklab, ${dColor} 14%, transparent)`,
                            color: dColor,
                          }}
                        >
                          {t.domain}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {t.motorType}
                        </span>
                        {t.isSystem && (
                          <span className="rounded bg-primary/12 px-1.5 py-0.5 text-[10px] text-primary">系统</span>
                        )}
                      </div>

                      {/* Actions on hover */}
                      {!t.isSystem && !isRenaming && (
                        <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(t.id, t.name);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded bg-card/95 text-muted-foreground shadow-sm hover:text-primary"
                            title="重命名"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDel(t.id);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded bg-card/95 text-muted-foreground shadow-sm hover:text-destructive"
                            title="删除"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {/* Selected indicator */}
                      {isPending && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border/60 px-4 py-2.5">
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-7 items-center rounded-md border border-border px-3 text-[12px] text-foreground/80 hover:bg-muted"
            >
              取消
            </button>
            <button
              onClick={confirmApply}
              disabled={!pendingId}
              className="inline-flex h-7 items-center rounded-md bg-primary px-4 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              应用
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {confirmDel && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
          onClick={() => setConfirmDel(null)}
        >
          <div
            className="w-[340px] rounded-xl border border-border bg-popover p-4 shadow-[var(--shadow-elegant)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h4 className="text-[14px] font-semibold text-foreground">删除模板</h4>
            </div>
            <p className="mb-4 text-[12.5px] text-muted-foreground">
              确定要删除模板「{templates.find((t) => t.id === confirmDel)?.name}」吗？此操作不可恢复。
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDel(null)}
                className="inline-flex h-8 items-center rounded-md border border-border px-3 text-[12px] text-foreground/80 hover:bg-muted"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const tpl = templates.find((t) => t.id === confirmDel);
                  remove(confirmDel);
                  setConfirmDel(null);
                  toast.success(`已删除模板「${tpl?.name ?? ""}」`);
                }}
                className="inline-flex h-8 items-center rounded-md bg-destructive px-4 text-[12px] font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
