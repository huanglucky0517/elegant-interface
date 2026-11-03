import { useState } from "react";
import { Box, ChevronDown, Eye, EyeOff, Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PART_LABELS, partComponents, effectivePart, isPartHighlighted, type InstanceState, type MotorParameters, type PartTarget, type StructureType, type PartKey, type PartState } from "./model-state";
const sphereColors: Record<PartKey, string> = { rotor: "bg-motor-steel", stator: "bg-motor-steel", magnet: "bg-motor-magnet", winding: "bg-motor-copper" };
export function PartsPanel({ parts, selected, onSelect, onVisibility, onTransparency, onClose, structure, parameters, onHover, hovered, instances }: {
  parts: PartState; selected: PartTarget; onSelect: (part: PartTarget) => void;
  onVisibility: (part: PartTarget, visible: boolean) => void;
  onTransparency: (part: PartTarget, percent: number) => void; onClose: () => void;
  hovered: PartTarget | null; instances: InstanceState;
  structure: StructureType; parameters: MotorParameters; onHover: (target: PartTarget | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [openParts, setOpenParts] = useState<Partial<Record<PartKey, boolean>>>({});
  const transparency = Math.round((1 - effectivePart(parts, instances, selected).opacity) * 100);
  const selectedLabel = selected.id ? partComponents(selected.key, structure, parameters).find((p) => p.id === selected.id)?.label ?? PART_LABELS[selected.key] : PART_LABELS[selected.key];
  return <section aria-label="三维零部件结构" className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card/95 shadow-[var(--shadow-card)]" onMouseLeave={() => onHover(null)}>
    <header className="flex items-center gap-2 border-b border-border px-3 py-2"><Layers className="h-4 w-4 text-primary" /><h2 className="flex-1 text-[13px] font-semibold">三维零部件结构</h2><Button variant="ghost" size="icon" className="h-6 w-6" aria-label="关闭零部件结构" onClick={onClose}><X /></Button></header>
    <Button variant="ghost" className="h-10 w-full justify-start rounded-none px-3 text-[12px]" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}><ChevronDown className={cn(!expanded && "-rotate-90")} /><Box className="text-primary" /><span>轴向磁通电机</span></Button>
    {expanded && <div className="min-h-0 overflow-y-auto pb-2">{(Object.keys(PART_LABELS) as PartKey[]).map((key) => {
      const components = partComponents(key, structure, parameters);
      return <div key={key}>
        <div onMouseEnter={() => onHover({ key })} onMouseLeave={() => onHover(null)} className={cn("flex h-10 items-center gap-1 pl-5 pr-2", (isPartHighlighted(selected, key, "") || isPartHighlighted(hovered, key, "")) && "bg-motor-highlight/10 ring-1 ring-inset ring-motor-highlight")}>
          <Button size="icon" variant="ghost" className="group h-7 w-7 shrink-0" aria-label={`${openParts[key] ? "收起" : "展开"}${PART_LABELS[key]}分部件`} title={`${openParts[key] ? "收起" : "展开"}${PART_LABELS[key]}分部件`} aria-expanded={!!openParts[key]} onClick={() => setOpenParts((p) => ({ ...p, [key]: !p[key] }))}>
            <span className={cn("part-sphere h-[18px] w-[18px] rounded-full group-hover:hidden group-focus-visible:hidden", sphereColors[key])} />
            <ChevronDown className={cn("hidden group-hover:block group-focus-visible:block", !openParts[key] && "-rotate-90")} />
          </Button>
          <Button variant="ghost" onClick={() => onSelect({ key })} className={cn("h-full min-w-0 flex-1 justify-start rounded-none px-1 text-[12px]", selected.key === key && "text-motor-highlight")}>{PART_LABELS[key]}<span className="ml-auto text-[10px] font-normal text-muted-foreground">{components.length}</span></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`${parts[key].visible ? "隐藏" : "显示"}${PART_LABELS[key]}`} title={`${parts[key].visible ? "隐藏" : "显示"}${PART_LABELS[key]}`} onClick={() => onVisibility({ key }, !parts[key].visible)}>{parts[key].visible ? <Eye /> : <EyeOff className="text-muted-foreground" />}</Button>
        </div>
        {openParts[key] && <div className="pb-1">{components.map((component) => {
          const target = { key, id: component.id };
          const state = effectivePart(parts, instances, target);
          const active = isPartHighlighted(selected, key, component.id) || isPartHighlighted(hovered, key, component.id);
          return <div key={component.id} className={cn("mx-2 flex h-8 items-center rounded border border-transparent", active && "border-motor-highlight bg-motor-highlight/10")} onMouseEnter={() => onHover(target)} onMouseLeave={() => onHover(null)}>
            <Button variant="ghost" aria-pressed={selected.id === component.id} className="h-full min-w-0 flex-1 justify-start gap-2 rounded-none pl-9 pr-1 text-[11px] font-normal" onFocus={() => onHover(target)} onBlur={() => onHover(null)} onClick={() => onSelect(target)}><span className={cn("part-sphere h-2.5 w-2.5 shrink-0 rounded-full", sphereColors[key])} /><span className="truncate">{component.label}</span></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" aria-label={`${state.visible ? "隐藏" : "显示"}${component.label}`} onClick={() => onVisibility(target, !state.visible)}>{state.visible ? <Eye /> : <EyeOff className="text-muted-foreground" />}</Button>
          </div>;
        })}</div>}
      </div>;
    })}</div>}
    <div className="shrink-0 space-y-3 border-t border-border px-3 py-3"><h3 className="text-[12px] font-semibold">属性</h3><div className="flex justify-between text-[12px]"><span className="text-muted-foreground">名称</span><span>{selectedLabel}</span></div>
      <div className="flex items-center justify-between text-[12px]"><label htmlFor="part-transparency" className="text-muted-foreground">透明度</label><output>{transparency}%</output></div>
      <input id="part-transparency" aria-label={`${selectedLabel}透明度`} type="range" min={0} max={100} step={1} value={transparency} onChange={(e) => onTransparency(selected, Number(e.target.value))} className="h-2 w-full cursor-pointer accent-primary" />
    </div>
  </section>;
}