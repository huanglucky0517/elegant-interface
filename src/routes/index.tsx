import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, Table2 } from "lucide-react";
import { LeftNav, TopBar } from "@/components/workspace/Chrome";
import { AnalysisFlow } from "@/components/workspace/AnalysisFlow";
import { ParamCard } from "@/components/workspace/ParamCard";
import { AdvancedToggle, CloseButton, TabPill } from "@/components/workspace/Controls";
import { TemplateBar } from "@/components/workspace/TemplateBar";
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
  const { active, activeModule } = useTemplates();
  const cards = active.modules[activeModule].cards;

  return (
    <main className="flex-1 overflow-x-auto">
      <div className="mx-auto max-w-[1280px] px-6 pt-5 pb-12">
        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-full bg-muted/70 p-1">
              <TabPill active icon={<LayoutGrid className="h-3.5 w-3.5" />}>
                选项卡
              </TabPill>
              <TabPill icon={<Table2 className="h-3.5 w-3.5" />}>表格数据</TabPill>
            </div>
            <TemplateBar />
          </div>
          <div className="flex items-center gap-3">
            <AdvancedToggle />
            <CloseButton />
          </div>
        </div>

        {/* Header */}
        <div className="mb-4 flex items-baseline gap-3">
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
            {moduleTitle[activeModule]}
          </h1>
          <span className="text-[12px] text-muted-foreground">
            共 {cards.length} 项 · 已启用 {cards.filter((c) => c.enabled).length} 项
          </span>
        </div>

        {cards.length === 0 ? (
          <EmptyModule />
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {cards.map((card) => (
              <ParamCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyModule() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
      <p className="text-[14px] text-muted-foreground">
        当前模板的此模块尚未配置参数项
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground/70">
        切换到「系统默认 · 综合方案」模板，或基于当前复制后自定义
      </p>
    </div>
  );
}
