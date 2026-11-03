import { useState } from "react";
import { Box, ChevronDown, Eye, EyeOff, Folder, Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PART_LABELS, type PartKey, type PartState } from "./model-state";
export function PartsPanel({ parts, selected, onSelect, onVisibility, onTransparency, onClose }: {
  parts: PartState; selected: PartKey; onSelect: (part: PartKey) => void;
  onVisibility: (part: PartKey, visible: boolean) => void;
  onTransparency: (part: PartKey, percent: number) => void; onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const transparency = Math.round((1 - parts[selected].opacity) * 100);
  return <section aria-label="三维零部件结构" className="absolute right-4 top-24 z-10 w-[236px] rounded-lg border border-border bg-card/95 shadow-[var(--shadow-card)]">
    <header className="flex items-center gap-2 border-b border-border px-3 py-2"><Layers className="h-4 w-4 text-primary" /><h2 className="flex-1 text-[13px] font-semibold">三维零部件结构</h2><Button variant="ghost" size="icon" className="h-6 w-6" aria-label="关闭零部件结构" onClick={onClose}><X /></Button></header>
    <Button variant="ghost" className="h-10 w-full justify-start rounded-none px-3 text-[12px]" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}><ChevronDown className={cn(!expanded && "-rotate-90")} /><Box className="text-primary" /><span>轴向磁通电机</span></Button>
    {expanded && <div className="pb-2">{(Object.keys(PART_LABELS) as PartKey[]).map((key) => <div key={key} className={cn("flex h-9 items-center pr-2", selected === key && "bg-primary-soft")}>
      <Button variant="ghost" onClick={() => onSelect(key)} className={cn("h-full flex-1 justify-start rounded-none pl-9 text-[12px]", selected === key && "text-primary")}><Folder className="text-muted-foreground" />{PART_LABELS[key]}</Button>
      <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`${parts[key].visible ? "隐藏" : "显示"}${PART_LABELS[key]}`} title={`${parts[key].visible ? "隐藏" : "显示"}${PART_LABELS[key]}`} onClick={() => onVisibility(key, !parts[key].visible)}>{parts[key].visible ? <Eye /> : <EyeOff className="text-muted-foreground" />}</Button>
    </div>)}</div>}
    <div className="space-y-3 border-t border-border px-3 py-3"><h3 className="text-[12px] font-semibold">属性</h3><div className="flex justify-between text-[12px]"><span className="text-muted-foreground">名称</span><span>{PART_LABELS[selected]}</span></div>
      <div className="flex items-center justify-between text-[12px]"><label htmlFor="part-transparency" className="text-muted-foreground">透明度</label><output>{transparency}%</output></div>
      <input id="part-transparency" aria-label={`${PART_LABELS[selected]}透明度`} type="range" min={0} max={100} step={1} value={transparency} onChange={(e) => onTransparency(selected, Number(e.target.value))} className="h-2 w-full cursor-pointer accent-primary" />
    </div>
  </section>;
}