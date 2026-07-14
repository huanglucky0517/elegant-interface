import { useState } from "react";
import { AlertCircle, ChevronDown, Copy, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FailureDetail {
  code?: string;
  message: string;
}

export interface FailureItem {
  id: string;
  title: string;
  details: FailureDetail[];
}

const DEFAULT_FAILURES: FailureItem[] = [
  {
    id: "flux",
    title: "磁链计算失败",
    details: [
      { code: "E1021", message: "EMOnline 加载 UDO 对象出错" },
      { code: "E1044", message: "VeProject-新建电机-工况求解失败：Cannot found laminate plugin with type \"udlam35-double-v\"" },
      { code: "E1099", message: "Solve machine error." },
    ],
  },
  {
    id: "cogging",
    title: "齿槽转矩计算失败",
    details: [
      { code: "E2011", message: "EMOnline 加载 UDO 对象出错" },
      { code: "E2033", message: "Mesh generation failed on rotor slot region." },
      { code: "E2098", message: "Solve machine error." },
    ],
  },
  {
    id: "ind",
    title: "交直轴电感计算失败",
    details: [
      { code: "E3001", message: "EMOnline 加载 UDO 对象出错" },
      { code: "E3050", message: "Cannot found laminate plugin with type \"udlam35-double-v\"" },
      { code: "E3092", message: "Solve machine error." },
    ],
  },
  {
    id: "bemf",
    title: "永磁反电势计算失败",
    details: [
      { code: "E4002", message: "EMOnline 加载 UDO 对象出错" },
      { code: "E4041", message: "VeProject 工况求解失败：magnetization curve missing." },
      { code: "E4088", message: "Solve machine error." },
    ],
  },
  {
    id: "nvh",
    title: "多负载工况振动噪声计算失败",
    details: [
      { code: "E5013", message: "EMOnline 加载 UDO 对象出错" },
      { code: "E5062", message: "NVH coupling data not exported by EM stage." },
      { code: "E5090", message: "Solve machine error." },
    ],
  },
  {
    id: "demag-t",
    title: "退磁分析(转矩)失败",
    details: [
      { code: "E6011", message: "EMOnline 加载 UDO 对象出错" },
      { code: "E6055", message: "Cannot found laminate plugin with type \"udlam35-double-v\"" },
      { code: "E6089", message: "Solve machine error." },
    ],
  },
  {
    id: "demag-p",
    title: "退磁分析(功率)失败",
    details: [
      { code: "E7010", message: "EMOnline 加载 UDO 对象出错" },
      { code: "E7057", message: "Operating point out of demagnetization envelope." },
      { code: "E7091", message: "Solve machine error." },
    ],
  },
];

export function DesignFailedDialog({
  open,
  onClose,
  failures = DEFAULT_FAILURES,
}: {
  open: boolean;
  onClose: () => void;
  failures?: FailureItem[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(failures.map((f) => [f.id, true])),
  );

  if (!open) return null;

  const toggle = (id: string) =>
    setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const copyAll = () => {
    const text = failures
      .map(
        (f) =>
          `● ${f.title}\n` +
          f.details.map((d) => `   [${d.code ?? "-"}] ${d.message}`).join("\n"),
      )
      .join("\n\n");
    navigator.clipboard.writeText(text).then(
      () => toast.success("已复制全部错误信息"),
      () => toast.error("复制失败"),
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <div
        className="relative flex max-h-[86vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-12px_rgba(76,29,149,0.35)]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.72_0.19_10)] via-[oklch(0.66_0.22_355)] to-[oklch(0.6_0.24_300)] px-6 pb-8 pt-7 text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <button
            onClick={onClose}
            aria-label="关闭"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white/90 backdrop-blur transition hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 shadow-inner backdrop-blur">
              <AlertCircle className="h-7 w-7" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[22px] font-semibold leading-tight tracking-tight">设计失败</h2>
              <p className="mt-1 text-[13px] font-medium text-white/85">
                共 {failures.length} 项计算未通过 · 请查看详细日志后重试
              </p>
            </div>
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-3">
          <div className="flex items-center gap-2 text-[12.5px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-600">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              失败 {failures.length}
            </span>
            <span>点击每一项查看详细信息</span>
          </div>
          <button
            onClick={copyAll}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <Copy className="h-3.5 w-3.5" />
            复制全部
          </button>
        </div>

        {/* Failure list */}
        <div className="flex-1 overflow-y-auto bg-slate-50/60 px-5 py-4">
          <ul className="space-y-2.5">
            {failures.map((f) => {
              const isOpen = expanded[f.id];
              return (
                <li
                  key={f.id}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-white transition-shadow",
                    isOpen
                      ? "border-rose-200/70 shadow-[0_4px_18px_-8px_rgba(244,63,94,0.25)]"
                      : "border-slate-200/80 hover:border-rose-200/70 hover:shadow-sm",
                  )}
                >
                  <button
                    onClick={() => toggle(f.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm">
                      <X className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="flex-1 truncate text-[14px] font-semibold text-slate-800">
                      {f.title}
                    </span>
                    <span className="text-[11.5px] font-medium text-slate-400">
                      {f.details.length} 条详情
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-slate-400 transition-transform duration-200",
                        isOpen && "rotate-180 text-rose-500",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <ul className="mx-4 mb-3 space-y-1.5 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 font-mono text-[12px] leading-relaxed text-slate-600">
                        {f.details.map((d, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-white"
                          >
                            <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400/80" />
                            {d.code && (
                              <span className="shrink-0 rounded bg-rose-100/70 px-1.5 py-px text-[10.5px] font-semibold tracking-wider text-rose-600">
                                {d.code}
                              </span>
                            )}
                            <span className="min-w-0 break-words text-slate-700">{d.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="text-[13px] font-medium text-slate-500 transition hover:text-slate-800"
          >
            返回产品库
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              重新计算
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-lg bg-[image:var(--gradient-primary)] px-5 text-[13px] font-semibold text-white shadow-[var(--shadow-elegant)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              查看产品详情
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
