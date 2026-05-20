import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Check, X, LayoutGrid, Search, AlertTriangle, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTemplates } from "./templates/store";
import { DOMAINS } from "./templates/types";
import type { Domain } from "./templates/types";

const DEFAULT_W = 760;
const DEFAULT_H = 560;
const MIN_W = 520;
const MIN_H = 420;

const formatDate = (ts?: number) => {
  if (!ts) return "—";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};


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
  const [size, setSize] = useState<{ w: number; h: number }>({ w: DEFAULT_W, h: DEFAULT_H });
  const popRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const margin = 8;
    const w = size.w;
    const h = size.h;
    let x = r.left;
    let y = r.bottom + 6;
    x = Math.min(Math.max(margin, x), window.innerWidth - w - margin);
    y = Math.min(Math.max(margin, y), window.innerHeight - h - margin);
    setPos({ x, y });
     
  }, [open]);

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

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current && popRef.current) {
        const w = popRef.current.offsetWidth;
        const h = popRef.current.offsetHeight;
        const margin = 4;
        let x = e.clientX - dragRef.current.dx;
        let y = e.clientY - dragRef.current.dy;
        x = Math.min(Math.max(margin, x), window.innerWidth - w - margin);
        y = Math.min(Math.max(margin, y), window.innerHeight - h - margin);
        setPos({ x, y });
      }
      if (resizeRef.current) {
        const margin = 4;
        const { startX, startY, startW, startH } = resizeRef.current;
        const maxW = window.innerWidth - (pos?.x ?? margin) - margin;
        const maxH = window.innerHeight - (pos?.y ?? margin) - margin;
        const w = Math.min(Math.max(MIN_W, startW + (e.clientX - startX)), maxW);
        const h = Math.min(Math.max(MIN_H, startH + (e.clientY - startY)), maxH);
        setSize({ w, h });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [pos]);

  const startDrag = (e: React.MouseEvent) => {
    if (!popRef.current) return;
    const r = popRef.current.getBoundingClientRect();
    dragRef.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    document.body.style.userSelect = "none";
  };

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h };
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

  const domainCounts = useMemo(() => {
    const m = new Map<Domain, number>();
    templates.forEach((t) => m.set(t.domain, (m.get(t.domain) ?? 0) + 1));
    return m;
  }, [templates]);

  const visibleDomains = useMemo(
    () => DOMAINS.filter((d) => (domainCounts.get(d) ?? 0) > 0),
    [domainCounts],
  );

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
            width: size.w,
            height: size.h,
            visibility: pos ? "visible" : "hidden",
          }}
          className="z-50 flex flex-col rounded-2xl border border-border/60 bg-popover p-0 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
        >
          {/* Header */}
          <div
            onMouseDown={startDrag}
            className="flex cursor-move items-center justify-between border-b border-border/60 px-4 py-3 select-none"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60" />
              <LayoutGrid className="h-4 w-4 text-primary" />
              <h4 className="text-[14px] font-semibold text-foreground">模板库</h4>
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
                className="h-8 w-full rounded-full border border-border bg-background pl-8 pr-8 text-[12.5px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="清除"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Body: sidebar + list */}
          <div className="flex min-h-0 flex-1 gap-3 px-4 pt-3 pb-3">
            {/* Left sidebar */}
            <nav className="w-[148px] shrink-0 overflow-auto pr-1">
              <ul className="flex flex-col gap-0.5">
                {(["全部", ...visibleDomains] as const).map((d) => {
                  const isOn = domainFilter === d;
                  const count = d === "全部" ? templates.length : domainCounts.get(d) ?? 0;
                  return (
                    <li key={d}>
                      <button
                        onClick={() => setDomainFilter(d)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors",
                          isOn
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-foreground/80 hover:bg-muted",
                        )}
                      >
                        <span className="truncate">{d}</span>
                        <span
                          className={cn(
                            "ml-2 shrink-0 tabular-nums text-[11px]",
                            isOn ? "text-primary/70" : "text-muted-foreground",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Right: cards */}
            <div className="min-w-0 flex-1 overflow-auto pr-1">
              {filtered.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-[12px] text-muted-foreground">
                  未找到匹配模板
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {filtered.map((t) => {
                    const isPending = t.id === pendingId;
                    const isRenaming = renaming === t.id;
                    const editable = t.ownership === "personal";
                    const isSystem = t.ownership === "system";
                    const isEnterprise = t.ownership === "enterprise";
                    const cardBg = isSystem
                      ? "#F9FAFE"
                      : isEnterprise
                        ? "#F5F5F5"
                        : undefined;
                    return (
                      <li
                        key={t.id}
                        role="button"
                        onClick={() => !isRenaming && setPendingId(t.id)}
                        style={cardBg ? { backgroundColor: cardBg } : undefined}
                        className={cn(
                          "group relative cursor-pointer rounded-xl border px-4 py-3 transition-all",
                          !cardBg && "bg-card",
                          isPending
                            ? "border-primary ring-2 ring-primary/25"
                            : "border-border/60 hover:border-primary/40",
                          !cardBg && !isPending && "hover:bg-muted/30",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
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
                                  className="h-7 w-full max-w-[320px] rounded border border-input bg-background pl-2 pr-1 text-[13px] focus:border-primary focus:outline-none"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    commitRename();
                                  }}
                                  className="text-primary"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span
                                  className="text-[13.5px] font-medium leading-snug text-foreground break-words"
                                  title={t.name}
                                >
                                  {t.name}
                                </span>
                                {isSystem && (
                                  <span
                                    className="rounded-md px-1.5 py-0.5 text-[10.5px] font-medium"
                                    style={{ backgroundColor: "#EDE7FB", color: "#5B21B6" }}
                                  >
                                    系统
                                  </span>
                                )}
                                {isEnterprise && (
                                  <span
                                    className="rounded-md px-1.5 py-0.5 text-[10.5px] font-medium"
                                    style={{ backgroundColor: "#FFE8D1", color: "#C2410C" }}
                                  >
                                    企业
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Tags */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className="rounded-md border border-border/70 bg-background/70 px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
                                {t.motorType}
                              </span>
                              <span className="rounded-md border border-border/70 bg-background/70 px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
                                {t.domain}
                              </span>
                            </div>
                            <div className="mt-1.5 text-[11.5px] tabular-nums text-muted-foreground">
                              {formatDate(t.createdAt)}
                            </div>
                          </div>

                          {editable && !isRenaming && (
                            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startRename(t.id, t.name);
                                }}
                                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-primary"
                                title="重命名"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDel(t.id);
                                }}
                                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-destructive"
                                title="删除"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
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

          {/* Resize handle */}
          <div
            onMouseDown={startResize}
            className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
            title="拖拽调整大小"
            style={{
              background:
                "linear-gradient(135deg, transparent 0 50%, hsl(var(--muted-foreground) / 0.5) 50% 60%, transparent 60% 70%, hsl(var(--muted-foreground) / 0.5) 70% 80%, transparent 80%)",
              borderBottomRightRadius: "1rem",
            }}
          />
        </div>
      )}

      {/* Delete confirm */}
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
