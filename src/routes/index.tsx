import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, Table2 } from "lucide-react";
import { LeftNav, TopBar } from "@/components/workspace/Chrome";
import { AnalysisFlow } from "@/components/workspace/AnalysisFlow";
import {
  ParamCard,
  ParamRow,
  NumInput,
  YesNo,
  MiniCheckbox,
} from "@/components/workspace/ParamCard";
import { AdvancedToggle, CloseButton, TabPill } from "@/components/workspace/Controls";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "电磁性能 — 数智工程师" },
      { name: "description", content: "永磁同步电机电磁性能分析参数配置工作台。" },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopBar />
      <div className="flex flex-1">
        <LeftNav />

        <main className="flex-1 overflow-x-auto">
          <div className="mx-auto max-w-[1280px] px-6 pt-5 pb-12">
            {/* Toolbar */}
            <div className="mb-5 flex items-center justify-between">
              <div className="inline-flex items-center gap-1 rounded-full bg-muted/70 p-1">
                <TabPill active icon={<LayoutGrid className="h-3.5 w-3.5" />}>
                  选项卡
                </TabPill>
                <TabPill icon={<Table2 className="h-3.5 w-3.5" />}>表格数据</TabPill>
              </div>
              <div className="flex items-center gap-3">
                <AdvancedToggle />
                <CloseButton />
              </div>
            </div>

            {/* Four columns */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {/* Column 1 */}
              <div className="space-y-4">
                <ParamCard title="电阻">
                  <ParamRow label="温度（℃）">
                    <NumInput value={25} />
                  </ParamRow>
                  <ParamRow label="扁线AC电阻">
                    <YesNo defaultYes={false} />
                  </ParamRow>
                </ParamCard>

                <ParamCard title="静磁场" />

                <ParamCard title="磁链" />

                <ParamCard title="气隙磁密">
                  <ParamRow label="谐波分析">
                    <YesNo defaultYes={false} />
                  </ParamRow>
                </ParamCard>

                <ParamCard title="线反电势">
                  <ParamRow label="磁钢温度（℃）">
                    <NumInput value={25} />
                  </ParamRow>
                  <ParamRow label="谐波分析">
                    <YesNo defaultYes={false} />
                  </ParamRow>
                </ParamCard>

                <ParamCard title="齿槽转矩" collapsible>
                  <ParamRow label="机械一周内齿槽转矩周期数">
                    <NumInput value={12} />
                  </ParamRow>
                  <ParamRow label="仿真周期数">
                    <NumInput value={2} />
                  </ParamRow>
                  <ParamRow label="每周期仿真步数">
                    <NumInput value={180} />
                  </ParamRow>
                </ParamCard>

                <ParamCard title="短路分析">
                  <ParamRow label="三相电路">
                    <MiniCheckbox />
                  </ParamRow>
                  <ParamRow label="二相电路">
                    <MiniCheckbox defaultChecked />
                  </ParamRow>
                  <ParamRow label="一相电路">
                    <MiniCheckbox defaultChecked />
                  </ParamRow>
                </ParamCard>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <ParamCard title="电感" enabled={false}>
                  <ParamRow label="空转子线电感">
                    <MiniCheckbox />
                  </ParamRow>
                  <ParamRow label="线电感">
                    <MiniCheckbox />
                  </ParamRow>
                  <ParamRow label="交直轴电感">
                    <MiniCheckbox />
                  </ParamRow>
                  <ParamRow label="考虑耦合">
                    <YesNo />
                  </ParamRow>
                </ParamCard>

                <ParamCard title="MAP图" collapsible>
                  <ParamRow label="母线电压(V)">
                    <NumInput value={540} />
                  </ParamRow>
                  <ParamRow label="线电流限幅 (A)">
                    <NumInput value={150} />
                  </ParamRow>
                  <ParamRow label="弱磁电流限幅 (A)">
                    <NumInput value={-80} />
                  </ParamRow>
                  <ParamRow label="控制算法">
                    <select className="h-7 w-24 rounded-md border border-input bg-background px-2 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>MTPA</option>
                    </select>
                  </ParamRow>
                  <ParamRow label="转速范围(rpm)">
                    <NumInput value={3500} />
                  </ParamRow>
                  <ParamRow label="转矩范围 (Nm)">
                    <NumInput value={60} />
                  </ParamRow>
                </ParamCard>

                <ParamCard title="额定工况" collapsible>
                  <ParamRow label="额定功率(kW)">
                    <NumInput value={4} />
                  </ParamRow>
                  <ParamRow label="额定转速(rpm)">
                    <NumInput value={1500} />
                  </ParamRow>
                  <ParamRow label="仿真电周期数" hint>
                    <NumInput value={3} />
                  </ParamRow>
                  <ParamRow label="步数/周期数" hint>
                    <NumInput value={60} />
                  </ParamRow>
                  <ParamRow label="末端周期数">
                    <NumInput value={1} />
                  </ParamRow>
                  <ParamRow label="绕组温度(℃)">
                    <NumInput value={75} />
                  </ParamRow>
                  <ParamRow label="磁钢工作温度(℃)">
                    <NumInput value={20} />
                  </ParamRow>
                </ParamCard>
              </div>

              {/* Column 3 */}
              <div className="space-y-4">
                <ParamCard title="过载工况" collapsible>
                  <ParamRow label="过载倍数">
                    <NumInput value={2} />
                  </ParamRow>
                  <ParamRow label="仿真电周期数" hint>
                    <NumInput value={3} />
                  </ParamRow>
                  <ParamRow label="步数/周期数" hint>
                    <NumInput value={60} />
                  </ParamRow>
                  <ParamRow label="末端周期数">
                    <NumInput value={1} />
                  </ParamRow>
                  <ParamRow label="绕组温度(℃)">
                    <NumInput value={75} />
                  </ParamRow>
                  <ParamRow label="磁钢工作温度(℃)">
                    <NumInput value={20} />
                  </ParamRow>
                </ParamCard>

                <ParamCard title="外特性曲线" collapsible>
                  <ParamRow label="横轴">
                    <select className="h-7 w-24 rounded-md border border-input bg-background px-2 text-[13px]">
                      <option>转速</option>
                    </select>
                  </ParamRow>
                  <ParamRow label="纵轴">
                    <div className="inline-flex h-7 items-center gap-1 rounded-md border border-input bg-background px-2 text-[12px]">
                      <span className="inline-flex items-center gap-1 rounded bg-primary-soft px-1.5 text-primary">
                        相电流 ✕
                      </span>
                      <span className="text-muted-foreground">+3</span>
                    </div>
                  </ParamRow>
                </ParamCard>

                <ParamCard title="有效材料重量" collapsible>
                  <ParamRow label="铜线单位成本 (元/kg)">
                    <NumInput value={72.5} />
                  </ParamRow>
                  <ParamRow label="磁钢单位成本 (元/kg)">
                    <NumInput value={450.0} />
                  </ParamRow>
                  <ParamRow label="硅钢片单位成本 (元/kg)">
                    <NumInput value={8.5} />
                  </ParamRow>
                </ParamCard>

                <ParamCard title="退磁分析" collapsible>
                  <ParamRow label="最大转矩工况">
                    <MiniCheckbox />
                  </ParamRow>
                  <ParamRow label="最大输出工况">
                    <MiniCheckbox defaultChecked />
                  </ParamRow>
                  <ParamRow label="短路最大电流工况">
                    <MiniCheckbox defaultChecked />
                  </ParamRow>
                  <ParamRow label="磁钢修正温度(℃)">
                    <NumInput value={20} />
                  </ParamRow>
                  <ParamRow label="退磁拐点(T)" hint>
                    <NumInput value={0.67} />
                  </ParamRow>
                </ParamCard>
              </div>

              {/* Column 4 */}
              <div className="space-y-4">
                <div className="rounded-xl border border-dashed border-primary/30 bg-primary-soft/40 p-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-primary/15 text-[11px] text-primary">
                      ✦
                    </span>
                    <span className="text-[14px] font-semibold text-primary">高级设置</span>
                  </div>
                  <p className="mt-1.5 text-[12px] text-muted-foreground">
                    打开顶部"高级设置"开关后，所有参数卡片将展开更细颗粒度的配置项。
                  </p>
                </div>

                <ParamCard title="损耗计算配置">
                  <ParamRow label="铁耗修正系数">
                    <NumInput value={1.2} />
                  </ParamRow>
                  <ParamRow label="杂散损耗系数 (%)">
                    <NumInput value={0.8} />
                  </ParamRow>
                </ParamCard>
              </div>
            </div>
          </div>
        </main>

        <AnalysisFlow />
      </div>
    </div>
  );
}
