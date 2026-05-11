import { useState, type DragEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, Table2, Plus, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeftNav, TopBar } from "@/components/workspace/Chrome";
import { AnalysisFlow } from "@/components/workspace/AnalysisFlow";
import { CardLibrary } from "@/components/workspace/CardLibrary";
import { ParamCard } from "@/components/workspace/ParamCard";
import { AdvancedToggle, CloseButton, TabPill } from "@/components/workspace/Controls";
import { TemplateProvider, useTemplates } from "@/components/workspace/templates/store";
import type { ModuleKey } from "@/components/workspace/templates/types";

const moduleTitle: Record<ModuleKey, string> = {
  em: "电磁性能",
  thermal: "温升",
  stress: "应力",
  nvh: "振动噪音",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "分析流程模板 — 数智工程师" },
      { name: "description", content: "永磁同步电机分析流程模板库与参数配置工作台。" },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  return (
    <TemplateProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <TopBar />
        <div className="flex flex-1">
          <LeftNav />
          <Workspace />
          <AnalysisFlow />
        </div>
      </div>
    </TemplateProvider>
  );
}

function Workspace() {
  const { active, activeModule, toggleCardEnabled } = useTemplates();
  const cards = active.modules[activeModule].cards;
  const inWorkspace = cards.filter((c) => c.enabled);
  const [dragOver, setDragOver] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(true);

  const onDragOver = (e: DragEvent) => {
    if (e.dataTransfer.types.includes("text/x-card-id")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (!dragOver) setDragOver(true);
    }
  };
  const onDragLeave = (e: DragEvent) => {
    if (e.currentTarget === e.target) setDragOver(false);
  };
  const onDrop = (e: DragEvent) => {
    const id = e.dataTransfer.getData("text/x-card-id");
    setDragOver(false);
    if (!id) return;
    const target = cards.find((c) => c.id === id);
    if (target && !target.enabled) toggleCardEnabled(id);
  };

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar: title + tabs on the left, advanced + close on the right */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-baseline gap-2">
            <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
              {moduleTitle[activeModule]}
            </h1>
            <span className="text-[12px] text-muted-foreground">
              已选择 {inWorkspace.length} 项
            </span>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-muted/70 p-1">
            <TabPill active icon={<LayoutGrid className="h-3.5 w-3.5" />}>
              选项卡
            </TabPill>
            <TabPill icon={<Table2 className="h-3.5 w-3.5" />}>表格数据</TabPill>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AdvancedToggle />
          <CloseButton />
        </div>
      </div>

      {/* Body: workspace canvas + floating card library panel (overlays on top) */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto px-6 py-4">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "min-h-[400px] rounded-xl transition-colors",
              dragOver && "bg-primary-soft/40 ring-2 ring-primary/40 ring-offset-4 ring-offset-background",
            )}
          >
            {inWorkspace.length === 0 ? (
              <EmptyDropZone />
            ) : (
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
                {inWorkspace.map((card) => (
                  <ParamCard key={card.id} card={card} />
                ))}
              </div>
            )}
          </div>
        </div>
        <CardLibrary />
      </div>
    </main>
  );
}

function EmptyDropZone() {
  return (
    <div className="flex h-[360px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/30 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <p className="mt-3 text-[14px] font-medium text-foreground">分栏页暂无卡片</p>
      <p className="mt-1 text-[12px] text-muted-foreground">
        从右侧"计算任务卡"勾选或拖拽卡片到此处
      </p>
    </div>
  );
}
