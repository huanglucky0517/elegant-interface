import { useState } from "react";
import { Plus, Pencil, Trash2, Copy, FileText, Check, X, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTemplates } from "./templates/store";

export function TemplateBar() {
  const { templates, active, activeId, setActiveId, duplicateAsCustom, createBlank, rename, remove } =
    useTemplates();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string>(activeId);
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

  const openDialog = () => {
    setPendingId(activeId);
    setOpen(true);
  };

  const confirmApply = () => {
    if (pendingId && pendingId !== activeId) setActiveId(pendingId);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground transition-colors hover:border-primary/40"
      >
        <span className="inline-flex min-w-0 items-center gap-2 truncate">
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">选择模板</span>
        </span>
        <span className="shrink-0 truncate text-[11px] text-muted-foreground">{active.name}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="w-[420px] rounded-xl border border-border bg-popover p-4 shadow-[var(--shadow-elegant)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[14px] font-semibold text-foreground">选择模板</h4>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="max-h-[320px] overflow-auto rounded-lg border border-border">
              {templates.map((t) => {
                const isPending = t.id === pendingId;
                const isRenaming = renaming === t.id;
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "group flex items-center gap-2 border-b border-border px-2.5 py-2 text-[13px] transition-colors last:border-b-0",
                      isPending ? "bg-primary-soft text-primary" : "hover:bg-muted",
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
                        <button onClick={commitRename} className="text-primary hover:text-primary/80" title="确定">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setRenaming(null)} className="text-muted-foreground hover:text-foreground" title="取消">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="flex flex-1 items-center gap-2 truncate text-left"
                          onClick={() => setPendingId(t.id)}
                          onDoubleClick={() => {
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

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => duplicateAsCustom()}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-[12px] text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
              >
                <Copy className="h-3.5 w-3.5" /> 基于当前复制
              </button>
              <button
                onClick={() => {
                  const baseName = `新模板 ${templates.filter((t) => !t.isSystem).length + 1}`;
                  const id = createBlank(baseName);
                  setPendingId(id);
                  startRename(id, baseName);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-[12px] text-primary transition-colors hover:bg-primary-soft"
              >
                <Plus className="h-3.5 w-3.5" /> 新建模板
              </button>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-8 items-center rounded-md border border-border px-3 text-[12px] text-foreground/80 hover:bg-muted"
              >
                取消
              </button>
              <button
                onClick={confirmApply}
                className="inline-flex h-8 items-center rounded-md bg-primary px-4 text-[12px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
