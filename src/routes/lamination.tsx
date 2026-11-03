import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, X, Zap, Thermometer, Activity, Volume2, FileText, GitBranch, Image as ImageIcon, Table2, Check } from "lucide-react";
import { LeftNav, TopBar } from "@/components/workspace/Chrome";
import { cn } from "@/lib/utils";
import motorImg from "@/assets/axial-flux-motor.jpg";

export const Route = createFileRoute("/lamination")({
  head: () => ({
    meta: [
      { title: "指定冲片 — 数智工程师" },
      { name: "description", content: "选择定子/转子冲片并配置几何参数，预览轴向磁通电机模型。" },
      { property: "og:title", content: "指定冲片 — 数智工程师" },
      { property: "og:description", content: "冲片库选择与定子、转子几何参数配置。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LaminationPage,
});

const base = [
  { label: "极数", value: "8" },
  { label: "定子槽数", value: "12" },
  { label: "定子外径(mm)", value: "145" },
  { label: "定子内径(mm)", value: "90" },
  { label: "气隙(mm)", value: "0.7" },
];
const statorParams = [
  { label: "切边数", value: "0" },
  { label: "切边宽度(mm)", value: "110" },
  { label: "齿部修型", value: false },
  { label: "b0(mm)", value: "5" },
  { label: "h0(mm)", value: "2.5" },
  { label: "h01(mm)", value: "0" },
  { label: "h1(mm)", value: "2" },
  { label: "齿宽(mm)", value: "12" },
  { label: "平行轭半径(mm)", value: "64.5" },
  { label: "槽底倒角半径(mm)", value: "1" },
];
const rotorParams = [
  { label: "转子外径(mm)", value: "88.6" },
  { label: "转子内径(mm)", value: "30" },
  { label: "磁钢厚度(mm)", value: "4" },
  { label: "磁钢宽度(mm)", value: "16" },
  { label: "隔磁桥宽度(mm)", value: "1.2" },
  { label: "V型夹角(°)", value: "120" },
];

function Row({ label, value }: { label: string; value: string | boolean }) {
  const [v, setV] = useState(value);
  return (
    <div className="flex items-center gap-3 px-3 py-1.5">
      <span className="w-28 shrink-0 text-[12px] text-muted-foreground">{label}</span>
      {typeof v === "boolean" ? (
        <input type="checkbox" checked={v} onChange={(e) => setV(e.target.checked)} className="ml-auto h-3.5 w-3.5 accent-primary" />
      ) : (
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          className="w-full border-b border-border bg-transparent px-1 py-1 text-right text-[12px] outline-none focus:border-primary"
        />
      )}
    </div>
  );
}

function SelectRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5">
      <span className="w-10 shrink-0 text-[12px] text-muted-foreground">{label}</span>
      <button className="flex w-full items-center justify-end gap-2 border-b border-border px-1 py-1 text-[12px]">
        <span className="truncate">{value}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
    </div>
  );
}

function ParamPanel() {
  const [tab, setTab] = useState<"stator" | "rotor">("stator");
  const list = tab === "stator" ? statorParams : rotorParams;
  return (
    <div className="absolute left-0 top-0 z-10 w-[240px] rounded-br-lg border-b border-r border-border bg-card shadow-[var(--shadow-elegant)]">
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-[13px] font-semibold">指定冲片</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] text-primary">
            <CheckCircle2 className="h-3 w-3" /> 已覆盖
          </span>
          <X className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground" />
        </div>
      </div>
      <div className="px-3 pb-2">
        <button className="w-full rounded-md border border-border py-1.5 text-[12px] hover:border-primary hover:text-primary">冲片库</button>
      </div>
      <SelectRow label="定子" value="冲片18(斜肩平底槽_平行齿轭)" />
      <SelectRow label="转子" value="prius2010" />
      {base.map((p) => <Row key={p.label} {...p} />)}
      <div className="mt-1 grid grid-cols-2 border-b border-border text-[12px]">
        {(["stator", "rotor"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn("py-2 transition-colors", tab === t ? "border-b-2 border-primary text-foreground" : "text-muted-foreground")}
          >
            {t === "stator" ? "定子" : "转子"}
          </button>
        ))}
      </div>
      <div className="py-1">{list.map((p) => <Row key={tab + p.label} {...p} />)}</div>
    </div>
  );
}

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
  const [showDir, setShowDir] = useState(true);
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <main
          className="relative flex-1 overflow-hidden bg-card"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <ParamPanel />
          <div className="absolute inset-x-0 top-6 text-center text-[13px]">易泰达驱动电机冲片-副本（轴向磁通）</div>
          <label className="absolute right-4 top-14 z-10 inline-flex items-center gap-1.5 rounded border border-border bg-card px-2 py-1 text-[12px]">
            <input type="checkbox" checked={showDir} onChange={(e) => setShowDir(e.target.checked)} className="accent-primary" />
            显示充磁方向
          </label>
          <div className="flex h-full items-center justify-center pl-[260px] pr-8 pt-12">
            <img
              src={motorImg}
              alt="轴向磁通电机三维模型"
              width={1408}
              height={1056}
              className={cn("max-h-full max-w-full object-contain mix-blend-multiply", !showDir && "saturate-50")}
            />
          </div>
        </main>
        <RightPanel />
      </div>
    </div>
  );
}
