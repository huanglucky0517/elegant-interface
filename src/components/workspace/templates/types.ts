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
}

export interface ModuleData {
  cards: Card[];
}

export interface Template {
  id: string;
  name: string;
  isSystem: boolean;
  modules: Record<ModuleKey, ModuleData>;
}
