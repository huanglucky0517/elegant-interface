import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Check, Bike, Car, Cpu, Droplets, Wind, Fan, Wrench, Plane } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DomainParamsPanel,
  DEFAULT_CONDITIONS,
  type WorkCondition,
  type ConvertedMetric,
} from "@/components/products/DomainParamsPanel";
import { ProductMatchPanel } from "@/components/products/ProductMatchPanel";
import { useMatchHistory, type MatchCondition } from "@/hooks/use-match-history";

export const Route = createFileRoute("/products/design")({
  head: () => ({
    meta: [
      { title: "新建产品设计 — 数智工程师" },
      { name: "description", content: "选择应用领域与电机类型，设置工况参数并匹配已有电机产品。" },
      { property: "og:title", content: "新建产品设计 — 数智工程师" },
      { property: "og:description", content: "应用领域参数设置、指标转换与产品匹配流程。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DesignPage,
});

const DOMAINS = [
  { key: "moto", label: "电动摩托车", Icon: Bike },
  { key: "ev", label: "电动汽车", Icon: Car },
  { key: "servo", label: "伺服传动", Icon: Cpu },
  { key: "pump", label: "水泵电机", Icon: Droplets },
  { key: "compressor", label: "空压机", Icon: Wind },
  { key: "fan", label: "工业风扇", Icon: Fan },
  { key: "tool", label: "电动工具", Icon: Wrench },
  { key: "uav", label: "无人机", Icon: Plane },
];

const MOTOR_TYPES = ["交流永磁同步电动机", "无刷永磁直流电机", "鼠笼式三相感应电机", "开关磁阻电机"];

const STEPS = ["选择应用领域", "选择电机类型", "参数设置与匹配"];

function DesignPage() {
  const navigate = useNavigate();
  const { addRecord } = useMatchHistory();
  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState("moto");
  const [motorType, setMotorType] = useState(MOTOR_TYPES[0]);
  const [conditions, setConditions] = useState<WorkCondition[]>(DEFAULT_CONDITIONS);
  const [metrics, setMetrics] = useState<ConvertedMetric[] | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);

  const domainLabel = DOMAINS.find((d) => d.key === domain)?.label ?? "";

  const convert = () => {
    setMetrics([
      { condition: "爬坡工况", torque: "38.1938", speed: "1054.38", power: "4.217", current: "312.5" },
      { condition: "极速工况", torque: "19.0473", speed: "6326.26", power: "12.618", current: "486.2" },
      { condition: "峰值工况", torque: "52.6210", speed: "1840.11", power: "10.140", current: "647.0" },
    ]);
    toast.success("指标转换完成");
  };

  const matchConditions: MatchCondition[] = [
    { label: "爬坡工况", value: "输出转矩(Nm): 38.1938 / 电机转速(rpm): 1054.38", tolMin: "0", tolMax: "10" },
    { label: "极速工况", value: "输出转矩(Nm): 19.0473 / 电机转速(rpm): 6326.26", tolMin: "0", tolMax: "10" },
    { label: "输出相电流峰值", value: "适用控制器相电流峰值(A): 647", tolMin: "0", tolMax: "10" },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="relative flex shrink-0 items-center border-b border-border px-6 py-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> 返回产品库
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-foreground">新建产品设计</h1>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-8 py-4">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={cn(
              "inline-flex items-center gap-2 text-[13px]",
              i === step ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full text-[11px]",
                i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-10 pb-28 pt-2">
        {step === 0 && (
          <div className="mx-auto grid max-w-[1000px] grid-cols-4 gap-5">
            {DOMAINS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setDomain(key)}
                className={cn(
                  "relative flex h-[190px] flex-col items-center justify-center gap-3 rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/50",
                  domain === key ? "border-primary bg-primary-soft/40 ring-2 ring-primary/25" : "border-border",
                )}
              >
                {domain === key && (
                  <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <Icon className="h-12 w-12 text-primary/80" />
                <span className="text-[13px] font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="mx-auto grid max-w-[800px] grid-cols-2 gap-4">
            {MOTOR_TYPES.map((m) => (
              <button
                key={m}
                onClick={() => setMotorType(m)}
                className={cn(
                  "flex h-[92px] items-center justify-center rounded-xl border bg-card text-[14px] font-medium transition-all hover:border-primary/50",
                  motorType === m ? "border-primary bg-primary-soft/40 text-primary ring-2 ring-primary/25" : "border-border",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto max-w-[720px] rounded-xl border border-border bg-card p-6">
            <div className="text-[14px] font-semibold text-foreground">设计概要</div>
            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">应用领域</dt>
                <dd>{domainLabel}</dd>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">电机类型</dt>
                <dd>{motorType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">指标转换</dt>
                <dd>{metrics ? "已完成" : "未进行"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-[12.5px] text-muted-foreground">
              点击右下角「应用领域参数设置」配置工况参数，完成指标转换后即可进行产品匹配。
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 right-0 flex items-center gap-3 px-10 py-5">
        <button
          onClick={() => setPanelOpen(true)}
          className="inline-flex h-9 items-center rounded-md bg-[#E8890C] px-4 text-[13px] font-semibold text-white hover:bg-[#d37e0a]"
        >
          应用领域参数设置
        </button>
        <button
          onClick={() => setStep((s) => Math.min(2, s + 1))}
          disabled={step === 2}
          className="inline-flex h-9 items-center rounded-md bg-[image:var(--gradient-primary)] px-5 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
        >
          下一步
        </button>
      </div>

      <DomainParamsPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        conditions={conditions}
        onChange={setConditions}
        metrics={metrics}
        onConvert={convert}
        onMatch={() => setMatchOpen(true)}
      />

      <ProductMatchPanel
        open={matchOpen}
        onClose={() => setMatchOpen(false)}
        onBack={() => setMatchOpen(false)}
        conditions={matchConditions}
        onConfirm={(product, used) => {
          addRecord({ domain: domainLabel, motorType, conditions: used, product, isFinal: !!product });
          toast.success(product ? `已选定最终匹配方案并记录：${product.name}` : "已记录：未匹配到结果");
          setMatchOpen(false);
          setPanelOpen(false);
          navigate({ to: "/products" });
        }}
      />
    </div>
  );
}
