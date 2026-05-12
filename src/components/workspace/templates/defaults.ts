import type { Card, ModuleData, Template } from "./types";

const c = (
  id: string,
  title: string,
  params: Card["params"],
  opts: Partial<Pick<Card, "enabled" | "advancedOpen">> = {},
): Card => ({
  id,
  title,
  enabled: opts.enabled ?? true,
  advancedOpen: opts.advancedOpen ?? false,
  params,
});

// ===== 电磁性能 =====
const emCards: Card[] = [
  c("em-resistance", "电阻", [
    { key: "temp", label: "温度（℃）", type: "num", value: 25 },
    { key: "ac", label: "扁线AC电阻", type: "yesno", value: false },
    { key: "skin", label: "考虑趋肤效应", type: "yesno", value: true, advanced: true },
    { key: "freq", label: "频率范围(Hz)", type: "num", value: 1000, advanced: true },
  ]),
  c("em-static", "静磁场", [
    { key: "noload", label: "空载磁场", type: "checkbox", value: true },
    { key: "load", label: "负载磁场", type: "checkbox", value: true },
    { key: "mesh", label: "网格密度", type: "select", value: "标准", options: ["粗略", "标准", "精细"], advanced: true },
  ]),
  c("em-fluxlink", "磁链", [
    { key: "harmonic", label: "谐波分析", type: "yesno", value: false },
    { key: "order", label: "最大谐波次数", type: "num", value: 19, advanced: true },
  ]),
  c("em-airgap", "气隙磁密", [
    { key: "harmonic", label: "谐波分析", type: "yesno", value: true },
    { key: "order", label: "谐波次数", type: "num", value: 21, advanced: true },
    { key: "circ", label: "周向采样点", type: "num", value: 360, advanced: true },
  ]),
  c("em-emf", "线反电势", [
    { key: "magtemp", label: "磁钢温度（℃）", type: "num", value: 25 },
    { key: "harmonic", label: "谐波分析", type: "yesno", value: true },
    { key: "thd", label: "计算THD", type: "yesno", value: true, advanced: true },
    { key: "fft", label: "FFT窗函数", type: "select", value: "Hanning", options: ["矩形", "Hanning", "Hamming"], advanced: true },
  ]),
  c("em-cogging", "齿槽转矩", [
    { key: "period", label: "机械一周内齿槽转矩周期数", type: "num", value: 12 },
    { key: "sims", label: "仿真周期数", type: "num", value: 2 },
    { key: "steps", label: "每周期仿真步数", type: "num", value: 180 },
    { key: "solver", label: "求解器精度", type: "select", value: "高", options: ["标准", "高", "极高"], advanced: true },
  ]),
  c("em-short", "短路分析", [
    { key: "p3", label: "三相电路", type: "checkbox", value: false },
    { key: "p2", label: "二相电路", type: "checkbox", value: true },
    { key: "p1", label: "一相电路", type: "checkbox", value: true },
    { key: "phase", label: "故障初始相位(°)", type: "num", value: 0, advanced: true },
    { key: "duration", label: "持续时间(ms)", type: "num", value: 200, advanced: true },
  ]),
  c("em-inductance", "电感", [
    { key: "ll-noload", label: "空转子线电感", type: "checkbox", value: false },
    { key: "ll", label: "线电感", type: "checkbox", value: false },
    { key: "ldq", label: "交直轴电感", type: "checkbox", value: false },
    { key: "couple", label: "考虑耦合", type: "yesno", value: false },
    { key: "satgrid", label: "饱和扫描网格", type: "num", value: 21, advanced: true },
  ], { enabled: false }),
  c("em-map", "MAP图", [
    { key: "udc", label: "母线电压(V)", type: "num", value: 540 },
    { key: "ilim", label: "线电流限幅(A)", type: "num", value: 150 },
    { key: "idlim", label: "弱磁电流限幅(A)", type: "num", value: -80 },
    { key: "algo", label: "控制算法", type: "select", value: "MTPA", options: ["MTPA", "MTPV", "ZDC"] },
    { key: "nmax", label: "转速范围(rpm)", type: "num", value: 3500 },
    { key: "tmax", label: "转矩范围(Nm)", type: "num", value: 60 },
    { key: "ngrid", label: "转速网格数", type: "num", value: 30, advanced: true },
    { key: "tgrid", label: "转矩网格数", type: "num", value: 25, advanced: true },
    { key: "loss", label: "包含铁耗", type: "yesno", value: true, advanced: true },
  ]),
  c("em-rated", "额定工况", [
    { key: "p", label: "额定功率(kW)", type: "num", value: 4 },
    { key: "n", label: "额定转速(rpm)", type: "num", value: 1500 },
    { key: "ec", label: "仿真电周期数", type: "num", value: 3, hint: true },
    { key: "sp", label: "步数/周期数", type: "num", value: 60, hint: true },
    { key: "end", label: "末端周期数", type: "num", value: 1 },
    { key: "wt", label: "绕组温度(℃)", type: "num", value: 75 },
    { key: "mt", label: "磁钢工作温度(℃)", type: "num", value: 20 },
    { key: "phase0", label: "初始相位(°)", type: "num", value: 0, advanced: true },
    { key: "delta", label: "电流超前角(°)", type: "num", value: 12, advanced: true },
  ]),
  c("em-overload", "过载工况", [
    { key: "x", label: "过载倍数", type: "num", value: 2 },
    { key: "ec", label: "仿真电周期数", type: "num", value: 3, hint: true },
    { key: "sp", label: "步数/周期数", type: "num", value: 60, hint: true },
    { key: "end", label: "末端周期数", type: "num", value: 1 },
    { key: "wt", label: "绕组温度(℃)", type: "num", value: 75 },
    { key: "mt", label: "磁钢工作温度(℃)", type: "num", value: 20 },
    { key: "duration", label: "允许持续时间(s)", type: "num", value: 30, advanced: true },
  ]),
  c("em-curve", "外特性曲线", [
    { key: "x", label: "横轴", type: "select", value: "转速", options: ["转速", "转矩", "电流"] },
    { key: "y", label: "纵轴", type: "tags", value: ["相电流", "效率", "功率", "转矩"] },
    { key: "pts", label: "采样点数", type: "num", value: 50, advanced: true },
  ]),
  c("em-mass", "有效材料重量", [
    { key: "cu", label: "铜线单位成本(元/kg)", type: "num", value: 72.5 },
    { key: "mag", label: "磁钢单位成本(元/kg)", type: "num", value: 450.0 },
    { key: "si", label: "硅钢片单位成本(元/kg)", type: "num", value: 8.5 },
    { key: "scrap", label: "硅钢片利用率(%)", type: "num", value: 65, advanced: true },
  ]),
  c("em-demag", "退磁分析", [
    { key: "tmax", label: "最大转矩工况", type: "checkbox", value: false },
    { key: "pmax", label: "最大输出工况", type: "checkbox", value: true },
    { key: "scmax", label: "短路最大电流工况", type: "checkbox", value: true },
    { key: "mt", label: "磁钢修正温度(℃)", type: "num", value: 20 },
    { key: "knee", label: "退磁拐点(T)", type: "num", value: 0.67, hint: true },
    { key: "safety", label: "安全裕度(%)", type: "num", value: 10, advanced: true },
  ]),
  c("em-loss", "损耗计算配置", [
    { key: "iron", label: "铁耗修正系数", type: "num", value: 1.2 },
    { key: "stray", label: "杂散损耗系数(%)", type: "num", value: 0.8 },
    { key: "model", label: "铁耗模型", type: "select", value: "Bertotti", options: ["Steinmetz", "Bertotti", "改进Bertotti"], advanced: true },
    { key: "eddy", label: "磁钢涡流损耗", type: "yesno", value: true, advanced: true },
    { key: "winding", label: "绕组AC损耗", type: "yesno", value: true, advanced: true },
  ]),
  c("em-torque", "转矩脉动", [
    { key: "harmonic", label: "谐波分析", type: "yesno", value: true },
    { key: "order", label: "最大次数", type: "num", value: 24, advanced: true },
  ]),
  c("em-radial", "径向力波", [
    { key: "spatial", label: "空间阶次", type: "num", value: 8, advanced: true },
    { key: "time", label: "时间次数", type: "num", value: 24, advanced: true },
    { key: "fft", label: "二维FFT", type: "yesno", value: true, advanced: true },
  ], { enabled: false }),
];

// Group assignments for EM cards
const emGroupMap: Record<string, string> = {
  "em-resistance": "基础特性",
  "em-static": "基础特性",
  "em-fluxlink": "基础特性",
  "em-airgap": "基础特性",
  "em-emf": "基础特性",
  "em-inductance": "基础特性",
  "em-cogging": "转矩与力",
  "em-torque": "转矩与力",
  "em-radial": "转矩与力",
  "em-rated": "工况分析",
  "em-overload": "工况分析",
  "em-curve": "工况分析",
  "em-map": "工况分析",
  "em-short": "故障与安全",
  "em-demag": "故障与安全",
  "em-loss": "损耗与材料",
  "em-mass": "损耗与材料",
};
emCards.forEach((card) => {
  card.group = emGroupMap[card.id] ?? "其他";
});

// ===== 温升 =====
const thermalCards: Card[] = [
  c("th-loss", "损耗输入", [
    { key: "src", label: "损耗来源", type: "select", value: "电磁性能", options: ["电磁性能", "手工输入"] },
    { key: "scale", label: "损耗放大系数", type: "num", value: 1.0 },
  ]),
  c("th-cool", "冷却条件", [
    { key: "type", label: "冷却方式", type: "select", value: "自然冷却", options: ["自然冷却", "强迫风冷", "水冷", "油冷"] },
    { key: "tin", label: "进口温度(℃)", type: "num", value: 25 },
    { key: "flow", label: "流量(L/min)", type: "num", value: 8 },
    { key: "h", label: "对流系数(W/m²·K)", type: "num", value: 80, advanced: true },
  ]),
  c("th-steady", "稳态温升", [
    { key: "amb", label: "环境温度(℃)", type: "num", value: 40 },
    { key: "tol", label: "收敛容差", type: "num", value: 0.5, advanced: true },
  ]),
];

// ===== 应力 =====
const stressCards: Card[] = [
  c("st-rotor", "转子强度", [
    { key: "n", label: "校核转速(rpm)", type: "num", value: 18000 },
    { key: "factor", label: "安全系数", type: "num", value: 1.5 },
    { key: "mat", label: "屈服极限(MPa)", type: "num", value: 460, advanced: true },
  ]),
];

// ===== 振动噪音 =====
const nvhCards: Card[] = [
  c("nvh-modal", "模态分析", [
    { key: "n", label: "模态阶数", type: "num", value: 10 },
    { key: "fmax", label: "最大频率(Hz)", type: "num", value: 5000 },
  ]),
  c("nvh-radiate", "声辐射", [
    { key: "dist", label: "测点距离(m)", type: "num", value: 1.0 },
    { key: "weight", label: "A计权", type: "yesno", value: true },
  ]),
];

const mod = (cards: Card[]): ModuleData => ({ cards });

export const SYSTEM_TEMPLATE: Template = {
  id: "system-default",
  name: "系统默认 · 综合方案",
  isSystem: true,
  modules: {
    em: mod(emCards),
    thermal: mod(thermalCards),
    stress: mod(stressCards),
    nvh: mod(nvhCards),
  },
};

// Light template: same full card library, but fewer cards pre-selected into workspace.
const lightenEm = emCards.map((card, i) => ({
  ...card,
  enabled: i < 5, // only first 5 cards pre-selected
  advancedOpen: false,
}));
const lightenThermal = thermalCards.map((card, i) => ({ ...card, enabled: i < 1, advancedOpen: false }));
const lightenStress = stressCards.map((card) => ({ ...card, enabled: false, advancedOpen: false }));
const lightenNvh = nvhCards.map((card) => ({ ...card, enabled: false, advancedOpen: false }));

export const SYSTEM_LIGHT: Template = {
  id: "system-light",
  name: "系统模板 · 快速评估",
  isSystem: true,
  modules: {
    em: mod(lightenEm),
    thermal: mod(lightenThermal),
    stress: mod(lightenStress),
    nvh: mod(lightenNvh),
  },
};

export const SYSTEM_TEMPLATES: Template[] = [SYSTEM_TEMPLATE, SYSTEM_LIGHT];
