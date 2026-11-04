export const STRUCTURE_TYPES = ["单定子单转子", "双定子单转子", "单定子双转子"] as const;
export type StructureType = (typeof STRUCTURE_TYPES)[number];
export const STATOR_YOKE_TYPES = ["有定子轭", "无定子轭"] as const;
export type StatorYokeType = (typeof STATOR_YOKE_TYPES)[number];
export function hasStatorYoke(structure: StructureType, type: StatorYokeType) {
  return structure !== "单定子双转子" || type === "有定子轭";
}
export const WINDING_PHASES = ["A", "B", "C"] as const;
export function windingPhase(index: number) { return WINDING_PHASES[((Math.floor(index / 3) % 3) + 3) % 3]; }
export type PartKey = "rotor" | "stator" | "magnet" | "winding" | "other";
export const PART_LABELS: Record<PartKey, string> = { rotor: "转子", stator: "定子", magnet: "磁钢", winding: "绕组", other: "其他零部件" };
export type PartState = Record<PartKey, { visible: boolean; opacity: number }>;
export const INITIAL_PARTS: PartState = {
  rotor: { visible: true, opacity: 1 }, stator: { visible: true, opacity: 1 },
  magnet: { visible: true, opacity: 1 }, winding: { visible: true, opacity: 1 },
  other: { visible: true, opacity: 1 },
};
export function structureLayers(type: StructureType) {
  if (type === "双定子单转子") return { stators: [-1, 1], rotors: [0] };
  if (type === "单定子双转子") return { stators: [0], rotors: [-1, 1] };
  return { stators: [0.5], rotors: [-0.5] };
}
export function setPartVisibility(parts: PartState, key: PartKey, visible: boolean): PartState {
  return { ...parts, [key]: { ...parts[key], visible } };
}
export function setPartTransparency(parts: PartState, key: PartKey, percent: number): PartState {
  return { ...parts, [key]: { ...parts[key], opacity: 1 - Math.max(0, Math.min(100, percent)) / 100 } };
}
export interface MotorParameters {
  poles: number; slots: number; statorOuter: number; statorInner: number;
  rotorOuter: number; rotorInner: number; gap: number;
  statorHeight: number; rotorHeight: number; magnetOuter: number; magnetInner: number; backIron: number;
  slotWidth: number; yokeHeight: number; openingWidth: number; openingHeight: number; shoulderHeight: number; bottomRadius: number; magnetSpacing: number; poleRatio: number;
}
export const INITIAL_PARAMETERS: MotorParameters = {
  poles: 8, slots: 27, statorOuter: 330, statorInner: 224, rotorOuter: 350, rotorInner: 200, gap: 0.7,
  statorHeight: 40, rotorHeight: 15, magnetOuter: 330, magnetInner: 224, backIron: 7,
  slotWidth: 18, yokeHeight: 10, openingWidth: 7, openingHeight: 2, shoulderHeight: 1, bottomRadius: 1, magnetSpacing: 1, poleRatio: 0.5,
};
export interface PartComponent { id: string; label: string }
export interface PartTarget { key: PartKey; id?: string }
export type InstanceState = Record<string, { visible?: boolean; opacity?: number }>;
export const HIGHLIGHT_OPACITY = 0.4;
export function effectivePart(parts: PartState, instances: InstanceState, target: PartTarget) {
  const override = target.id ? instances[target.id] : undefined;
  return { visible: parts[target.key].visible && override?.visible !== false, opacity: override?.opacity ?? parts[target.key].opacity };
}
export function setTargetVisibility(parts: PartState, instances: InstanceState, target: PartTarget, visible: boolean) {
  return target.id ? { parts, instances: { ...instances, [target.id]: { ...instances[target.id], visible } } } : { parts: setPartVisibility(parts, target.key, visible), instances };
}
export function setTargetTransparency(parts: PartState, instances: InstanceState, target: PartTarget, percent: number) {
  return target.id ? { parts, instances: { ...instances, [target.id]: { ...instances[target.id], opacity: 1 - Math.max(0, Math.min(100, percent)) / 100 } } } : { parts: setPartTransparency(parts, target.key, percent), instances };
}
export const DETAIL_GEOMETRY: Record<string, keyof MotorParameters> = {
  toothOuter: "statorOuter", toothInner: "statorInner", statorHeight: "statorHeight", rotorHeight: "rotorHeight",
  magnetOuter: "magnetOuter", magnetInner: "magnetInner", backIron: "backIron", slotWidth: "slotWidth", yokeHeight: "yokeHeight",
  openingWidth: "openingWidth", openingHeight: "openingHeight", shoulderHeight: "shoulderHeight", bottomRadius: "bottomRadius", magnetSpacing: "magnetSpacing", poleRatio: "poleRatio",
};
export function motorDimensions(p: MotorParameters) {
  const scale = 2.5 / INITIAL_PARAMETERS.rotorOuter;
  const outerS = Math.max(0.2, p.statorOuter * scale / 2);
  const outerR = Math.max(0.2, p.rotorOuter * scale / 2);
  return { scale, outerS, outerR, innerS: Math.max(0.05, Math.min(outerS - 0.03, p.statorInner * scale / 2)), innerR: Math.max(0.05, Math.min(outerR - 0.03, p.rotorInner * scale / 2)), statorHeight: Math.max(0.03, p.statorHeight * scale), rotorHeight: Math.max(0.03, p.rotorHeight * scale) };
}
export function partComponents(key: PartKey, structure: StructureType, parameters: MotorParameters, yokeType: StatorYokeType = "有定子轭"): PartComponent[] {
  if (key === 'other') return [];
  const layers = structureLayers(structure);
  const slots = Math.min(72, Math.max(3, Math.round(parameters.slots)));
  const poles = Math.min(48, Math.max(2, Math.round(parameters.poles)));
  if (key === "rotor") return [...layers.rotors.map((_, i) => ({ id: `rotor-${i}`, label: `转子背铁 ${i + 1}` })), { id: "shaft", label: "转轴" }, { id: "hub", label: "轮毂" }];
  if (key === "stator") return layers.stators.flatMap((_, i) => [...(hasStatorYoke(structure, yokeType) ? [{ id: `core-${i}`, label: `定子轭 ${i + 1}` }] : []), ...Array.from({ length: slots }, (_, j) => ({ id: `tooth-${i}-${j}`, label: `定子 ${i + 1} · 齿 ${j + 1}` }))]);
  if (key === "winding") return layers.stators.flatMap((_, i) => Array.from({ length: slots }, (_, j) => ({ id: `coil-${i}-${j}`, label: `定子 ${i + 1} · ${windingPhase(j)}相线圈 ${j + 1}` })));
  return layers.rotors.flatMap((_, i) => Array.from({ length: poles }, (_, j) => ({ id: `magnet-${i}-${j}`, label: `转子 ${i + 1} · 磁钢 ${j + 1}` })));
}
export function isPartHighlighted(hovered: PartTarget | null, key: PartKey, id: string): boolean {
  return hovered?.key === key && (hovered.id === undefined || hovered.id === id);
}
export interface DetailParameter { key: string; label: string; value: string; options?: string[]; section: string }
export const STATOR_DETAILS: DetailParameter[] = [
  { key: "toothOuter", label: "齿顶外径(mm)", value: "330", section: "冲片" },
  { key: "toothInner", label: "齿顶内径(mm)", value: "224", section: "冲片" },
  { key: "statorHeight", label: "定子高度(mm)", value: "40", section: "冲片" },
  { key: "coreMaterial", label: "铁芯材料", value: "B35A230", section: "冲片" },
  { key: "slotWidth", label: "槽宽(mm)", value: "18", section: "槽" },
  { key: "yokeHeight", label: "轭部高度(mm)", value: "10", section: "槽" },
  { key: "openingWidth", label: "槽口宽度(mm)", value: "7", section: "槽" },
  { key: "openingHeight", label: "槽口高度(mm)", value: "2", section: "槽" },
  { key: "shoulderHeight", label: "槽肩高度(mm)", value: "1", section: "槽" },
  { key: "bottomType", label: "槽底类型", value: "平底", options: ["平底", "圆底"], section: "槽" },
  { key: "bottomRadius", label: "槽底圆角半径(mm)", value: "1", section: "槽" },
];
export const ROTOR_DETAILS: DetailParameter[] = [
  { key: "rotorHeight", label: "转子高度(mm)", value: "15", section: "冲片" },
  { key: "magnetShape", label: "磁钢形状", value: "Halbach阵列磁钢", options: ["Halbach阵列磁钢", "扇形磁钢", "矩形磁钢"], section: "冲片" },
  { key: "rotorMaterial", label: "转子背铁材料", value: "B35A230", section: "冲片" },
  { key: "magnetMaterial", label: "磁钢材料", value: "N42SH", section: "冲片" },
  { key: "magnetOuter", label: "磁钢外径(mm)", value: "330", section: "磁钢" },
  { key: "magnetInner", label: "磁钢内径(mm)", value: "224", section: "磁钢" },
  { key: "backIron", label: "背铁厚度(mm)", value: "7", section: "磁钢" },
  { key: "innerShape", label: "内边界形状", value: "圆弧", options: ["圆弧", "直线"], section: "磁钢" },
  { key: "spacingShape", label: "磁钢间隙形状", value: "平行", options: ["平行", "径向"], section: "磁钢" },
  { key: "magnetSpacing", label: "磁钢间距(mm)", value: "1", section: "磁钢" },
  { key: "poleRatio", label: "轴向磁钢周比", value: "0.5", section: "磁钢" },
];