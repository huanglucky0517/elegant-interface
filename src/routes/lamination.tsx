import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, X, Zap, Thermometer, Activity, Volume2, FileText, GitBranch, Image as ImageIcon, Table2, Check } from "lucide-react";
import { LeftNav, TopBar } from "@/components/workspace/Chrome";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MotorViewer from "@/components/lamination/MotorViewer";
import { PartsPanel } from "@/components/lamination/PartsPanel";
import { LaminationParams } from "@/components/lamination/LaminationParams";
import { INITIAL_PARTS, INITIAL_PARAMETERS, setTargetTransparency, setTargetVisibility, type InstanceState, type MotorParameters, type PartTarget, type PartKey, type StructureType } from "@/components/lamination/model-state";

export const Route = createFileRoute("/lamination")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "指定冲片 — 数智工程师" },
      { name: "description", content: "配置轴向磁通电机结构与定转子参数，旋转三维装配模型并控制零部件显示和透明度。" },
      { property: "og:title", content: "指定冲片 — 数智工程师" },
      { property: "og:description", content: "轴向磁通电机三维装配预览、零部件显示与定转子几何参数配置。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LaminationPage,
});

const flows = [
  { icon: Zap, label: "电磁性能", n: "14/17", color: "text-destructive" },
  { icon: Thermometer, label: "温升", n: "4/4", color: "text-primary" },
  { icon: Activity, label: "应力", n: "1/1", color: "text-primary" },
  { icon: Volume2, label: "振动噪声", n: "3/4", color: "text-primary" },
];
const results = [
  { icon: FileText, label: "工艺文件", n: "2/2" },
  { icon: GitBranch, label: "绕线图", n: "1/1" },
  { icon: ImageIcon, label: "图纸", n: "3/3" },
  { icon: Table2, label: "BOM表", n: "2/2" },
];

function RightPanel() {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-l border-border bg-card px-5 py-5">
      <h3 className="text-[15px] font-medium">分析流程</h3>
      <p className="mt-0.5 text-[11px] text-muted-foreground">选择初始方案设计需要分析的流程</p>
      <div className="mt-4 space-y-4">
        {flows.map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-[12px]">
            <f.icon className={cn("h-3.5 w-3.5", f.color)} />
            <span className="flex-1">{f.label}</span>
            <span className="text-muted-foreground">{f.n}</span>
            <Check className="h-3 w-3 text-primary" />
            <button className="text-primary hover:underline">选择</button>
          </div>
        ))}
      </div>
      <h3 className="mt-10 text-[15px] font-medium">结果文件</h3>
      <div className="mt-4 space-y-4">
        {results.map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <f.icon className="h-3.5 w-3.5" />
            <span className="flex-1 text-foreground/80">{f.label}</span>
            <span>{f.n}</span>
            <Check className="h-3 w-3" />
            <button className="hover:text-primary">选择</button>
          </div>
        ))}
      </div>
      <button className="mt-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[image:var(--gradient-primary)] text-[13px] text-primary-foreground shadow-[var(--shadow-elegant)]">
        <Zap className="h-3.5 w-3.5" /> 开始设计
      </button>
    </aside>
  );
}

function LaminationPage() {
  const [showDir, setShowDir] = useState(false);
  const [showMesh, setShowMesh] = useState(false);
  const [dimension, setDimension] = useState<keyof MotorParameters | null>(null);
  const [instances, setInstances] = useState<InstanceState>({});
  const [partsOpen, setPartsOpen] = useState(false);
  const [hovered, setHovered] = useState<PartTarget | null>(null);
  const [paramsOpen, setParamsOpen] = useState(true);
  const [selectedPart, setSelectedPart] = useState<PartTarget | null>(null);
  const [parts, setParts] = useState(INITIAL_PARTS);
  const [structure, setStructure] = useState<StructureType>("单定子双转子");
  const [parameters, setParameters] = useState(INITIAL_PARAMETERS);
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar />
      <div className="flex min-h-0 flex-1 overflow-x-auto">
        <LeftNav />
        <div className="flex min-w-[860px] flex-1">
          <main className="lamination-grid relative min-w-0 flex-1 overflow-hidden bg-card">
            <div className="absolute inset-x-4 top-5 z-10 text-center text-[13px]">易泰达驱动电机冲片-副本（轴向磁通）</div>
            <div className={cn("absolute top-5 z-30 flex gap-2", paramsOpen ? "right-4" : "left-4")}>
              {!paramsOpen && <Button variant="outline" size="sm" onClick={() => setParamsOpen(true)}>指定冲片</Button>}
              {!partsOpen && <Button variant="outline" size="sm" onClick={() => setPartsOpen(true)}>三维零部件结构</Button>}
            </div>
            <div className={`h-full w-full pt-12 ${paramsOpen ? "pl-[280px]" : ""} ${partsOpen ? "pr-[256px]" : ""}`}>
              <MotorViewer parameters={parameters} structure={structure} parts={parts} showDirection={showDir} showMesh={showMesh} dimension={dimension} selected={selectedPart} instances={instances} hovered={hovered} hover={setHovered} select={(target) => { setSelectedPart(target); setPartsOpen(true); }} />
            </div>
            {paramsOpen && <div className="absolute bottom-24 left-4 top-5 z-20 w-[264px]"><LaminationParams parameters={parameters} structure={structure} onStructure={setStructure} onDimension={setDimension} onParameter={(key, value) => { if (!Number.isFinite(value)) return; setParameters((p) => ({ ...p, [key]: value })); setDimension(key); }} onClose={() => { setParamsOpen(false); setDimension(null); }} /></div>}
            <div className="absolute bottom-24 right-4 top-5 z-20 flex w-[236px] flex-col items-stretch gap-3 pointer-events-none">
              {partsOpen && <div className="pointer-events-auto flex min-h-0 flex-col"><PartsPanel parts={parts} selected={selectedPart ?? { key: "stator" }} structure={structure} parameters={parameters} onHover={setHovered} hovered={hovered} instances={instances} onSelect={setSelectedPart} onVisibility={(target, visible) => { const next = setTargetVisibility(parts, instances, target, visible); setParts(next.parts); setInstances(next.instances); }} onTransparency={(target, percent) => { const next = setTargetTransparency(parts, instances, target, percent); setParts(next.parts); setInstances(next.instances); }} onClose={() => { setPartsOpen(false); setHovered(null); setSelectedPart(null); }} /></div>}
              <div className="pointer-events-auto shrink-0 w-full rounded-md border border-border bg-card/95 px-3 py-2 shadow-[var(--shadow-card)]">
                <label className="inline-flex items-center gap-2 text-[12px]"><input type="checkbox" checked={showDir} onChange={(e) => setShowDir(e.target.checked)} className="accent-primary" />显示充磁方向</label>
                <label className="mt-2 flex items-center gap-2 text-[12px]"><input type="checkbox" checked={showMesh} onChange={(e) => setShowMesh(e.target.checked)} className="accent-primary" />显示网格剖分</label>
              </div>
            </div>
          </main>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
