import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronLeft,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/workspace/Chrome";
import { DesignFailedDialog, type FailureItem } from "@/components/workspace/DesignFailedDialog";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "产品库 — 数智工程师" },
      { name: "description", content: "电机设计产品库,查看设计成功、失败、进行中的产品记录。" },
    ],
  }),
  component: ProductsPage,
});

type Status = "success" | "failed" | "designing" | "draft";

interface Product {
  id: string;
  name: string;
  domain: string;
  housing: string;
  motorType: string;
  startAt: string;
  endAt: string;
  creator: string;
  status: Status;
}

const CATEGORIES: { key: Status; label: string; count: number }[] = [
  { key: "success", label: "设计成功", count: 106 },
  { key: "failed", label: "设计失败", count: 10 },
  { key: "designing", label: "设计中", count: 0 },
  { key: "draft", label: "草稿箱", count: 27 },
];

const FOLDERS = [
  { name: "客户", color: "oklch(0.62 0.22 295)" },
  { name: "电机类型", color: "oklch(0.62 0.22 295)" },
  { name: "应用领域", color: "oklch(0.62 0.22 295)" },
  { name: "交流永磁同步电动机", color: "oklch(0.7 0.24 355)" },
  { name: "无刷永磁直流电机", color: "oklch(0.7 0.24 355)" },
  { name: "鼠笼三相感应电机", color: "oklch(0.7 0.24 355)" },
];

const PRODUCTS: Product[] = [
  { id: "p1", name: "双V转子冲片", domain: "电动汽车", housing: "方型带散热翅机壳", motorType: "交流永磁同步电动机", startAt: "2026-07-16 08:48:42", endAt: "2026-07-16 11:50:10", creator: "雷仁", status: "failed" },
  { id: "p2", name: "Halbach外转子_1", domain: "机器人", housing: "外转子永磁同步机壳", motorType: "交流永磁同步电动机", startAt: "2026-04-15 09:23:54", endAt: "2026-04-15 09:25:53", creator: "雷仁", status: "failed" },
  { id: "p3", name: "Halbach外转子", domain: "机器人", housing: "外转子永磁同步机壳", motorType: "交流永磁同步电动机", startAt: "2026-04-15 09:18:48", endAt: "2026-04-15 09:21:27", creator: "雷仁", status: "failed" },
  { id: "p4", name: "report", domain: "电动汽车", housing: "方型带散热翅机壳", motorType: "交流永磁同步电动机", startAt: "2026-03-06 08:53:33", endAt: "--", creator: "雷仁", status: "failed" },
  { id: "p5", name: "8极4kW三相感应电动机_2", domain: "水泵电机", housing: "立式强迫风冷", motorType: "鼠笼式三相感应电机", startAt: "2025-11-26 10:43:03", endAt: "2025-11-26 11:02:39", creator: "雷仁", status: "failed" },
  { id: "p6", name: "Y3-90S-2_1", domain: "水泵电机", housing: "立式强迫风冷", motorType: "鼠笼式三相感应电机", startAt: "2024-07-16 13:43:06", endAt: "2024-07-16 13:46:21", creator: "雷仁", status: "failed" },
  { id: "p7", name: "Y3-90S-2", domain: "水泵电机", housing: "立式强迫风冷", motorType: "鼠笼式三相感应电机", startAt: "2024-07-16 11:25:13", endAt: "2024-07-16 11:41:36", creator: "雷仁", status: "failed" },
  { id: "p8", name: "朱鹏程磁路法_1_技术支持_修改参数后", domain: "无人机", housing: "开式同轴风扇", motorType: "无刷永磁直流电机", startAt: "2024-07-02 13:45:20", endAt: "2024-07-02 13:47:57", creator: "雷仁", status: "failed" },
  { id: "p9", name: "超力冲片20240614", domain: "机器人", housing: "外转子永磁同步机壳", motorType: "交流永磁同步电动机", startAt: "2024-06-14 09:20:28", endAt: "2024-06-14 09:23:37", creator: "雷仁", status: "failed" },
  { id: "p10", name: "尺寸不一致", domain: "电动汽车", housing: "方型带散热翅机壳", motorType: "交流永磁同步电动机", startAt: "2024-01-18 16:38:25", endAt: "2024-01-18 16:40:00", creator: "雷仁", status: "failed" },
];

const FAILURE_PRESETS: Record<string, FailureItem[]> = {
  default: [
    {
      id: "steady",
      title: "稳态参数求解失败",
      details: [
        { code: "E1021", message: "EMOnline 加载 UDO 对象出错" },
        { code: "E1044", message: "VeProject-新建电机-工况求解失败：Cannot found laminate plugin with type \"udlam35-double-v\"" },
        { code: "E1099", message: "Solve machine error." },
      ],
    },
    {
      id: "flux",
      title: "磁链计算失败",
      details: [
        { code: "E2011", message: "EMOnline 加载 UDO 对象出错" },
        { code: "E2044", message: "VeProject 工况求解失败：magnetization curve missing." },
        { code: "E2099", message: "Solve machine error." },
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
  ],
};

function ProductsPage() {
  const [category, setCategory] = useState<Status>("failed");
  const [view, setView] = useState<"card" | "table">("table");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ domain: "全部", motor: "全部", housing: "全部" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<Product | null>(null);

  const products = useMemo(() => {
    return PRODUCTS.filter((p) => p.status === category)
      .filter((p) => (filters.domain === "全部" ? true : p.domain === filters.domain))
      .filter((p) => (filters.motor === "全部" ? true : p.motorType === filters.motor))
      .filter((p) => (filters.housing === "全部" ? true : p.housing === filters.housing))
      .filter((p) => (query ? p.name.toLowerCase().includes(query.toLowerCase()) : true));
  }, [category, filters, query]);

  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  };
  const toggleOne = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left rail */}
        <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-surface">
          <div className="flex flex-col gap-2 p-4">
            <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[image:var(--gradient-primary)] text-[13px] font-semibold text-primary-foreground shadow-[var(--shadow-elegant)]">
              <Sparkles className="h-3.5 w-3.5" /> 生成式设计
            </button>
            <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary-soft text-[13px] font-semibold text-primary hover:bg-primary/10">
              <Plus className="h-3.5 w-3.5" /> 设计产品
            </button>
          </div>

          <div className="px-4">
            <div className="mb-2 text-[12px] font-semibold text-foreground">产品库</div>
            <ul className="space-y-0.5">
              {CATEGORIES.map((c) => (
                <li key={c.key}>
                  <button
                    onClick={() => setCategory(c.key)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] transition-colors",
                      category === c.key
                        ? "bg-primary-soft font-semibold text-primary"
                        : "text-foreground/75 hover:bg-card",
                    )}
                  >
                    <span>{c.label}</span>
                    <span className="tabular-nums text-[12px] text-muted-foreground">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border-t border-border/60 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-foreground">产品文件夹</span>
              <button className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="space-y-0.5">
              {FOLDERS.map((f) => (
                <li key={f.name}>
                  <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] text-foreground/75 hover:bg-card">
                    <span className="h-3 w-3 rounded-sm" style={{ background: f.color }} />
                    <span className="truncate">{f.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto p-3">
            <Link
              to="/"
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> 返回工作台
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Filter bar */}
          <div className="flex shrink-0 items-center gap-4 border-b border-border bg-card/40 px-6 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="在产品库中搜索"
                className="h-8 w-[240px] rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <FilterSelect
              label="应用领域"
              value={filters.domain}
              options={["全部", ...new Set(PRODUCTS.map((p) => p.domain))]}
              onChange={(v) => setFilters((f) => ({ ...f, domain: v }))}
            />
            <FilterSelect
              label="电机类型"
              value={filters.motor}
              options={["全部", ...new Set(PRODUCTS.map((p) => p.motorType))]}
              onChange={(v) => setFilters((f) => ({ ...f, motor: v }))}
            />
            <FilterSelect
              label="机壳"
              value={filters.housing}
              options={["全部", ...new Set(PRODUCTS.map((p) => p.housing))]}
              onChange={(v) => setFilters((f) => ({ ...f, housing: v }))}
            />

            <div className="ml-auto inline-flex items-center rounded-md border border-border bg-background p-0.5">
              <ViewToggleBtn active={view === "card"} onClick={() => setView("card")} icon={<LayoutGrid className="h-4 w-4" />} label="卡片" />
              <ViewToggleBtn active={view === "table"} onClick={() => setView("table")} icon={<Table2 className="h-4 w-4" />} label="表格" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-5">
            {view === "table" ? (
              <TableView
                products={products}
                selected={selected}
                allSelected={allSelected}
                onToggleAll={toggleAll}
                onToggleOne={toggleOne}
                onOpenDetail={setDetail}
              />
            ) : (
              <CardView products={products} onOpenDetail={setDetail} />
            )}
          </div>
        </main>
      </div>

      <DesignFailedDialog
        open={!!detail}
        onClose={() => setDetail(null)}
        failures={detail ? (FAILURE_PRESETS.default) : []}
      />
    </div>
  );
}

function ViewToggleBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded px-2 text-[12px] font-medium transition-colors",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-input bg-background pl-3 pr-8 text-[13px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function TableView({
  products,
  selected,
  allSelected,
  onToggleAll,
  onToggleOne,
  onOpenDetail,
}: {
  products: Product[];
  selected: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onOpenDetail: (p: Product) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-primary-soft/60 text-left text-[12.5px] font-semibold text-foreground">
            <th className="w-10 px-4 py-3">
              <input type="checkbox" checked={allSelected} onChange={onToggleAll} className="h-3.5 w-3.5 accent-primary" />
            </th>
            <th className="px-4 py-3">产品名称</th>
            <th className="px-4 py-3">应用领域</th>
            <th className="px-4 py-3">机壳</th>
            <th className="px-4 py-3">电机类型</th>
            <th className="px-4 py-3">计算时间</th>
            <th className="w-[160px] px-4 py-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const isFailed = p.status === "failed";
            return (
              <tr
                key={p.id}
                className="group border-t border-border/60 transition-colors hover:bg-primary-soft/30"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => onToggleOne(p.id)}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-foreground/80">{p.domain}</td>
                <td className="px-4 py-3 text-foreground/80">{p.housing}</td>
                <td className="px-4 py-3 text-foreground/80">{p.motorType}</td>
                <td className="px-4 py-3 text-foreground/70 tabular-nums leading-tight">
                  <div>{p.startAt}</div>
                  <div className="text-muted-foreground">{p.endAt}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {isFailed && (
                      <button
                        onClick={() => onOpenDetail(p)}
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 text-[12px] font-medium text-rose-600 opacity-0 shadow-sm transition-all hover:bg-rose-100 group-hover:opacity-100"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        查看失败详情
                      </button>
                    )}
                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-16 text-center text-[13px] text-muted-foreground">
                当前分类下暂无产品
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CardView({
  products,
  onOpenDetail,
}: {
  products: Product[];
  onOpenDetail: (p: Product) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-border text-[13px] text-muted-foreground">
        当前分类下暂无产品
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      {products.map((p) => {
        const isFailed = p.status === "failed";
        return (
          <article
            key={p.id}
            className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <span className="text-[10px] font-semibold">电机</span>
                </div>
                <div className="leading-tight">
                  <div className="text-[12px] text-muted-foreground">{p.motorType}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">{p.domain}</div>
                </div>
              </div>
              <button className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            <h3 className="mt-3 truncate text-[14px] font-semibold text-foreground" title={p.name}>
              {p.name}
            </h3>
            <div className="mt-2 space-y-0.5 text-[11.5px] text-muted-foreground">
              <div>
                <span className="text-foreground/60">开始时间:</span> <span className="tabular-nums">{p.startAt}</span>
              </div>
              <div>
                <span className="text-foreground/60">结束时间:</span> <span className="tabular-nums">{p.endAt}</span>
              </div>
            </div>

            {isFailed && (
              <button
                onClick={() => onOpenDetail(p)}
                className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 text-[12.5px] font-semibold text-rose-600 transition-colors hover:bg-rose-100"
              >
                计算失败 <AlertCircle className="h-3.5 w-3.5" />
              </button>
            )}

            <div className="mt-3 border-t border-border/60 pt-2 text-[11.5px] text-muted-foreground">
              创建人:<span className="ml-1 text-foreground/75">{p.creator}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
