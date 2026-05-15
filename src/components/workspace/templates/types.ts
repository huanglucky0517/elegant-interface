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

export type Domain = "工业驱动" | "新能源汽车" | "家用电器" | "航空航天" | "通用";
export type MotorType = "永磁同步" | "异步" | "直流有刷" | "无刷直流" | "步进";

export const DOMAINS: Domain[] = ["工业驱动", "新能源汽车", "家用电器", "航空航天", "通用"];
export const MOTOR_TYPES: MotorType[] = ["永磁同步", "异步", "直流有刷", "无刷直流", "步进"];

export interface Template {
  id: string;
  name: string;
  isSystem: boolean;
  domain: Domain;
  motorType: MotorType;
  modules: Record<ModuleKey, ModuleData>;
  /** Sort weight: number of times this template was applied. */
  usageCount?: number;
  /** Creation timestamp (ms). System templates may omit this. */
  createdAt?: number;
}
