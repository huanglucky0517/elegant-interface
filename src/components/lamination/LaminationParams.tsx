import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DETAIL_GEOMETRY, STATOR_DETAILS, ROTOR_DETAILS, STRUCTURE_TYPES, type MotorParameters, type StructureType } from "./model-state";
export function LaminationParams({ parameters, structure, onStructure, onParameter, onDimension, onClose }: {
  parameters: MotorParameters; structure: StructureType; onStructure: (type: StructureType) => void;
  onParameter: (key: keyof MotorParameters, value: number) => void; onClose: () => void;
  onDimension: (key: keyof MotorParameters) => void;
}) {
  const [tab, setTab] = useState<"stator" | "rotor">("stator");
  const [details, setDetails] = useState<Record<string, string>>(() => Object.fromEntries([...STATOR_DETAILS, ...ROTOR_DETAILS].map((p) => [p.key, p.value])));
  const fields: { key: keyof MotorParameters; label: string }[] = [
    { key: "poles", label: "极数" }, { key: "slots", label: "槽数" },
    { key: "statorOuter", label: "定子外径(mm)" }, { key: "statorInner", label: "定子内径(mm)" },
    { key: "rotorOuter", label: "转子外径(mm)" }, { key: "rotorInner", label: "转子内径(mm)" }, { key: "gap", label: "气隙(mm)" },
  ];
  const list = tab === "stator" ? STATOR_DETAILS : ROTOR_DETAILS;
  return <aside aria-label="指定冲片参数" className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border border-border bg-card/95 shadow-[var(--shadow-card)]">
    <header className="flex shrink-0 items-center gap-2 px-3 py-3"><h2 className="flex-1 text-[13px] font-semibold">指定冲片</h2><span className="inline-flex items-center gap-1 text-[11px] text-primary"><CheckCircle2 className="h-3 w-3" />已覆盖</span><Button size="icon" variant="ghost" className="h-6 w-6" aria-label="关闭参数面板" onClick={onClose}><X /></Button></header>
    <div className="min-h-0 flex-1 overflow-y-auto pb-4">
      <div className="flex items-center gap-2 px-3 py-1.5"><label htmlFor="motor-structure" className="w-[104px] shrink-0 text-[12px] text-muted-foreground">结构类型</label><select id="motor-structure" aria-label="结构类型" value={structure} onChange={(e) => onStructure(e.target.value as StructureType)} className="h-8 min-w-0 flex-1 rounded border border-input bg-background p-1 text-[12px] outline-none focus:border-primary">{STRUCTURE_TYPES.map((s) => <option key={s}>{s}</option>)}</select></div>
      {fields.map(({ key, label }) => <div key={key} className="flex items-center gap-2 px-3 py-1.5"><label htmlFor={`motor-${key}`} className="w-[104px] shrink-0 text-[12px] text-muted-foreground">{label}</label><input id={`motor-${key}`} aria-label={label} type="number" value={parameters[key]} onFocus={() => onDimension(key)} onChange={(e) => onParameter(key, Number(e.target.value))} className="h-8 min-w-0 flex-1 rounded border border-input bg-background p-1 text-right text-[12px] outline-none focus:border-primary" /></div>)}
      <div role="tablist" aria-label="零部件参数" className="mt-3 grid grid-cols-2 border-b border-border">{(["stator", "rotor"] as const).map((t) => <Button role="tab" aria-selected={tab === t} key={t} variant="ghost" onClick={() => setTab(t)} className={cn("h-10 rounded-none border-b-2 text-[12px]", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{t === "stator" ? "定子" : "转子"}</Button>)}</div>
      <div role="tabpanel">{list.map((p, i) => <div key={p.key}>
        {(i === 0 || list[i - 1]?.section !== p.section) && <h3 className="px-3 pb-1 pt-3 text-[11px] font-semibold text-foreground">{p.section}</h3>}
        <div className="flex items-center gap-2 px-3 py-1.5"><label htmlFor={p.key} className="w-[104px] shrink-0 text-[12px] text-muted-foreground">{p.label}</label>{p.options ? <select id={p.key} value={details[p.key]} onChange={(e) => setDetails({ ...details, [p.key]: e.target.value })} className="h-8 min-w-0 flex-1 rounded border border-input bg-background p-1 text-[12px] outline-none focus:border-primary">{p.options.map((o) => <option key={o}>{o}</option>)}</select> : <input id={p.key} value={DETAIL_GEOMETRY[p.key] ? parameters[DETAIL_GEOMETRY[p.key]] : details[p.key]} onFocus={() => { const key = DETAIL_GEOMETRY[p.key]; if (key) onDimension(key); }} onChange={(e) => { const key = DETAIL_GEOMETRY[p.key]; if (key) onParameter(key, Number(e.target.value)); else setDetails({ ...details, [p.key]: e.target.value }); }} className="h-8 min-w-0 flex-1 rounded border border-input bg-background p-1 text-right text-[12px] outline-none focus:border-primary" />}</div>
      </div>)}</div>
    </div>
  </aside>;
}