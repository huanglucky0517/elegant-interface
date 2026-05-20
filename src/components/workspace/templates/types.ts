export type ModuleKey = "em" | "thermal" | "stress" | "nvh";

export type ParamType = "num" | "yesno" | "checkbox" | "select" | "tags";

export interface Param {
  key: string;
  label: string;
  type: ParamType;
  value: string | number | boolean | string[];
  unit?: string;
  hint?: boolean;
  advanced?: boolean;
  options?: string[];
  width?: "sm" | "md";
}

export interface Card {
  id: string;
  title: string;
  enabled: boolean;
  advancedOpen: boolean;
  params: Param[];
  group?: string;
}

export interface ModuleData {
  cards: Card[];
}

export type Domain =
  | "电动汽车"
  | "伺服传动"
  | "水泵电机"
  | "机器人"
  | "减速机电机"
  | "空压机"
  | "工业风扇"
  | "电动工具"
  | "无人机"
  | "机械手"
  | "电动摩托车"
  | "其他";

export type MotorType = "永磁同步" | "异步" | "直流有刷" | "无刷直流" | "步进";

export type Ownership = "system" | "enterprise" | "personal";

export const DOMAINS: Domain[] = [
  "电动汽车",
  "伺服传动",
  "水泵电机",
  "机器人",
  "减速机电机",
  "空压机",
  "工业风扇",
  "电动工具",
  "无人机",
  "机械手",
  "电动摩托车",
  "其他",
];
export const MOTOR_TYPES: MotorType[] = ["永磁同步", "异步", "直流有刷", "无刷直流", "步进"];

export interface Template {
  id: string;
  name: string;
  /** Deprecated: use `ownership` instead. Kept for backwards compatibility. */
  isSystem: boolean;
  ownership: Ownership;
  domain: Domain;
  motorType: MotorType;
  modules: Record<ModuleKey, ModuleData>;
  /** Sort weight: number of times this template was applied. */
  usageCount?: number;
  /** Creation timestamp (ms). System templates may omit this. */
  createdAt?: number;
}
