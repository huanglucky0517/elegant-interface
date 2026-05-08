import { useState } from "react";
import { ChevronDown, Plus, Pencil, Trash2, Copy, FileText, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTemplates } from "./templates/store";

export function TemplateBar() {
  const { templates, active, activeId, setActiveId, duplicateAsCustom, createBlank, rename, remove } =
    useTemplates();
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const startRename = (id: string, current: string) => {
    setRenaming(id);
    setDraftName(current);
  };
  const commitRename = () => {
    if (renaming && draftName.trim()) rename(renaming, draftName.trim());
    setRenaming(null);
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <span className="text-[12px] text-muted-foreground">分析流程模板</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 min-w-[220px] items-center justify-between gap-2 rounded-full border border-border bg-card px-4 text-[13px] font-medium text-foreground transition-colors hover:border-primary/40"
      >
        <span className="inline-flex items-center gap-2 truncate">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{active.name}</span>
          {active.isSystem && (
            <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] text-primary">
              系统
            </span>
          )}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-[88px] top-11 z-40 w-[340px] rounded-xl border border-border bg-popover p-2 shadow-[var(--shadow-elegant)]">
            <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              模板库
            </div>
            <ul className="max-h-[320px] overflow-auto">
              {templates.map((t) => {
                const isActive = t.id === activeId;
                const isRenaming = renaming === t.id;
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] transition-colors",
                      isActive ? "bg-primary-soft text-primary" : "hover:bg-muted",
                    )}
                  >
                    {isRenaming ? (
                      <>
                        <input
                          autoFocus
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setRenaming(null);
                          }}
                          className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          onClick={commitRename}
                          className="text-primary hover:text-primary/80"
                          title="确定"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setRenaming(null)}
                          className="text-muted-foreground hover:text-foreground"
                          title="取消"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="flex flex-1 items-center gap-2 truncate text-left"
                          onClick={() => {
                            setActiveId(t.id);
                            setOpen(false);
                          }}
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{t.name}</span>
                          {t.isSystem && (
                            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
                              系统
                            </span>
                          )}
                        </button>
                        {!t.isSystem && (
                          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startRename(t.id, t.name);
                              }}
                              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-card hover:text-primary"
                              title="重命名"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`删除模板「${t.name}」？`)) remove(t.id);
                              }}
                              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="删除"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-1 grid grid-cols-2 gap-1 border-t border-border pt-2">
              <button
                onClick={() => {
                  duplicateAsCustom();
                  setOpen(false);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
              >
                <Copy className="h-3.5 w-3.5" /> 基于当前复制
              </button>
              <button
                onClick={() => {
                  const id = createBlank(`新模板 ${templates.filter((t) => !t.isSystem).length + 1}`);
                  startRename(id, `新模板 ${templates.filter((t) => !t.isSystem).length + 1}`);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] text-primary transition-colors hover:bg-primary-soft"
              >
                <Plus className="h-3.5 w-3.5" /> 新建空模板
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
