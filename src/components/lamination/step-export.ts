import { DETAIL_GEOMETRY, STATOR_DETAILS, ROTOR_DETAILS, hasStatorYoke, type MotorParameters, type StatorYokeType, type StructureType } from "./model-state";
import type { MotorType, DetailValues } from './motor-config';

export const STEP_ENDPOINT = "http://localhost:8000/generate-step";
export const STEP_FILENAME = "motor_design.step";

export function stepPayload(parameters: MotorParameters, structure: StructureType, yokeType: StatorYokeType, motorType: MotorType = '轴向磁通电机', values: DetailValues = {}) {
  // Existing field names and millimetre units; numeric detail aliases use live dimensions.
  const details = Object.fromEntries([...STATOR_DETAILS, ...ROTOR_DETAILS].map((detail) => {
    const key = DETAIL_GEOMETRY[detail.key];
    return [detail.key, key ? parameters[key] : values[detail.key] ?? detail.value];
  }));
  return { ...details, ...parameters, motorType, topology: motorType === '轴向磁通电机' ? 'axial_flux' : 'radial_flux', structure, yokeType: hasStatorYoke(structure, yokeType) ? "有定子轭" : "无定子轭" };
}

export async function requestStep(payload: ReturnType<typeof stepPayload>, signal?: AbortSignal): Promise<Blob> {
  const response = await fetch(STEP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/step, application/octet-stream" },
    body: JSON.stringify(payload), signal,
  });
  if (!response.ok) throw new Error(`STEP 服务返回 HTTP ${response.status} ${response.statusText}`);
  const type = response.headers.get("Content-Type") ?? "";
  if (/json|html/i.test(type)) throw new Error(`STEP 服务返回 ${type}，预期为 STEP 文件流`);
  const blob = await response.blob();
  if (blob.size === 0) throw new Error("STEP 服务返回了空文件");
  return blob;
}

export function downloadStep(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = STEP_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function reportStepError(error: unknown) {
  console.error(`[STEP 导出失败] 工业模型加载/导出失败，POST ${STEP_ENDPOINT}：${error instanceof Error ? error.message : String(error)}。请确认本机后端已启动、支持 motorType/topology 参数、允许当前网站跨域访问（CORS），且浏览器允许访问本地网络及自动下载。`);
}