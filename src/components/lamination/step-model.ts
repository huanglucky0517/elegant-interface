import type { PartKey, PartComponent } from './model-state';

export interface StepMesh {
  name: string; color?: number[];
  attributes: { position: { array: number[] }; normal?: { array: number[] } };
  index: { array: number[] };
  brep_faces?: { first: number; last: number; color?: number[] | null }[];
}
export interface StepNode { name: string; meshes: number[]; children: StepNode[] }
export interface StepModel { success: boolean; root: StepNode; meshes: StepMesh[] }
export interface CadPart extends PartComponent { key: PartKey; mesh: StepMesh }
export function classifyCadPart(name: string): PartKey {
  if (/coil|winding|绕组|线圈/i.test(name)) return 'winding';
  if (/magnet|磁钢|永磁/i.test(name)) return 'magnet';
  if (/stator|tooth|yoke|定子|齿|轭/i.test(name)) return 'stator';
  if (/rotor|shaft|hub|转子|转轴|轮毂/i.test(name)) return 'rotor';
  return 'other';
}
export function cadParts(model: StepModel): CadPart[] {
  const names = new Map<number, string>();
  const visit = (node: StepNode, parent: string) => {
    const name = [parent, node.name].filter(Boolean).join(' / ');
    node.meshes?.forEach(index => names.set(index, name));
    node.children?.forEach(child => visit(child, name));
  };
  visit(model.root, '');
  return model.meshes.map((mesh, index) => {
    const label = mesh.name || names.get(index) || `STEP 实体 ${index + 1}`;
    return { id: `cad-${index}`, label, key: classifyCadPart(`${mesh.name} ${names.get(index) ?? ''}`), mesh };
  });
}
export async function parseStep(blob: Blob, signal: AbortSignal): Promise<StepModel> {
  const bytes = await blob.arrayBuffer();
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  return new Promise((resolve, reject) => {
    const worker = new Worker('/cad/step-worker.js');
    const cleanup = () => { worker.terminate(); signal.removeEventListener('abort', abort); };
    const abort = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')); };
    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = event => { cleanup(); if (event.data.error) reject(new Error(event.data.error)); else resolve(event.data.result); };
    worker.onerror = () => { cleanup(); reject(new Error('工业 STEP 解析器加载失败')); };
    worker.postMessage(bytes, [bytes]);
  });
}