import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, Line, Html } from "@react-three/drei";
import { CanvasTexture, DoubleSide, BufferGeometry, Float32BufferAttribute, Box3, Group, Mesh, MeshStandardMaterial, SRGBColorSpace, EdgesGeometry, WireframeGeometry, LineBasicMaterial, LineSegments, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { RotateCcw, Minus, Plus, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HIGHLIGHT_OPACITY, effectivePart, motorDimensions, hasStatorYoke, windingPhase, isPartHighlighted, structureLayers, type StatorYokeType, type InstanceState, type PartTarget, type MotorParameters, type PartKey, type PartState, type StructureType } from "./model-state";

function InteractivePart({ target, hovered, selected, instances, parts, showMesh, meshColor, hover, select, highlight, selectionColor, children }: {
  target: PartTarget; selected: PartTarget | null; instances: InstanceState; parts: PartState; showMesh: boolean; meshColor: string; hovered: PartTarget | null; hover: (target: PartTarget | null) => void;
  select: (target: PartTarget) => void; highlight: string; selectionColor: string; children: ReactNode;
}) {
  const group = useRef<Group>(null);
  const { invalidate } = useThree();
  const isSelected = isPartHighlighted(selected, target.key, target.id ?? "");
  const active = isPartHighlighted(hovered, target.key, target.id ?? "") || isSelected;
  const fillColor = isSelected ? selectionColor : highlight;
  const state = effectivePart(parts, instances, target);
  useEffect(() => {
    const meshes: Mesh[] = [];
    group.current?.traverse((object) => { if (object instanceof Mesh) meshes.push(object); });
    const cleanup: (() => void)[] = [];
    meshes.forEach((mesh) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        if (!(material instanceof MeshStandardMaterial)) return;
        const original = material.clone();
        material.color.set(active ? fillColor : original.color);
        material.map = active ? null : original.map;
        material.opacity = active ? HIGHLIGHT_OPACITY : state.opacity;
        material.transparent = material.opacity < 1;
        material.depthWrite = material.opacity >= 1;
        material.depthTest = true;
        material.emissive.set(fillColor); material.emissiveIntensity = active ? 0.3 : 0;
        material.needsUpdate = true;
        cleanup.push(() => { material.copy(original); original.dispose(); });
      });
      if (active || showMesh) {
        const geometry = active ? new EdgesGeometry(mesh.geometry, 25) : new WireframeGeometry(mesh.geometry);
        const material = new LineBasicMaterial({ color: active ? highlight : meshColor, transparent: true, opacity: active ? 1 : 0.45, depthTest: true, depthWrite: false, toneMapped: false });
        const lines = new LineSegments(geometry, material);
        lines.renderOrder = active ? 20 : 1;
        lines.raycast = () => undefined;
        mesh.add(lines);
        cleanup.push(() => { mesh.remove(lines); geometry.dispose(); material.dispose(); });
      }
    });
    invalidate();
    return () => cleanup.forEach((dispose) => dispose());
  }, [active, highlight, fillColor, children, invalidate, state.opacity, showMesh, meshColor]);
  return <group ref={group} visible={state.visible} onClick={(event) => { event.stopPropagation(); if (event.delta <= 4) select(target); }} onPointerOver={(event) => { event.stopPropagation(); hover(target); }} onPointerOut={(event) => { event.stopPropagation(); hover(null); }}>{children}</group>;

}
function ReadySignal({ onReady }: { onReady: () => void }) {
  const ready = useRef(false);
  useFrame(() => { if (!ready.current) { ready.current = true; onReady(); } });
  return null;
}
function FitCamera() {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    camera.zoom = Math.min(1, size.width / Math.max(size.height, 1) / 0.9);
    camera.updateProjectionMatrix(); invalidate();
  }, [camera, size.width, size.height, invalidate]);
  return null;
}
function AnnotationArrow({ tip, from, colorClass = "fill-motor-annotation" }: { tip: [number, number, number]; from: [number, number, number]; colorClass?: string }) {
  const group = useRef<Group>(null);
  const arrow = useRef<SVGSVGElement>(null);
  const { camera, size } = useThree();
  const vectors = useMemo(() => ({ tip: new Vector3(), from: new Vector3() }), []);
  useFrame(() => {
    if (!group.current || !arrow.current) return;
    vectors.tip.set(...tip); vectors.from.set(...from);
    group.current.localToWorld(vectors.tip).project(camera);
    group.current.localToWorld(vectors.from).project(camera);
    const angle = Math.atan2(-(vectors.tip.y - vectors.from.y) * size.height, (vectors.tip.x - vectors.from.x) * size.width);
    arrow.current.style.transform = `rotate(${angle}rad)`;
  });
  return <group ref={group}><Html center position={tip} style={{ pointerEvents: "none" }}><svg ref={arrow} width="16" height="14" viewBox="-16 -7 16 14" className={`overflow-visible ${colorClass}`} style={{ transformOrigin: "100% 50%", marginLeft: -16 }} aria-hidden="true"><path d="M 0 0 L -16 -7 L -16 7 Z" /></svg></Html></group>;
}
function DimensionAnnotation({ parameter, parameters, structure, color }: { parameter: keyof MotorParameters; parameters: MotorParameters; structure: StructureType; color: string }) {
  if (parameter === "slots" || parameter === "poles" || parameter === "poleRatio") return null;
  const dimensions = motorDimensions(parameters);
  const stator = parameter.startsWith("stator") || ["slotWidth", "yokeHeight", "openingWidth", "openingHeight", "shoulderHeight", "bottomRadius"].includes(parameter);
  const layers = structureLayers(structure);
  const spacing = (dimensions.statorHeight + dimensions.rotorHeight) / 2 + parameters.gap * dimensions.scale;
  const layer = stator ? layers.stators[0] ?? 0 : layers.rotors[0] ?? 0;
  const inner = parameter.endsWith("Inner");
  const radial = parameter.endsWith("Inner") || parameter.endsWith("Outer");
  const radius = parameter.startsWith("magnet") ? parameters[parameter] * dimensions.scale / 2 : stator ? (inner ? dimensions.innerS : dimensions.outerS) : (inner ? dimensions.innerR : dimensions.outerR);
  const y = layer * spacing + (stator ? dimensions.statorHeight : dimensions.rotorHeight) / 2 + 0.1;
  const offset = Math.max(dimensions.outerS, dimensions.outerR) + 0.22;
  const length = Math.max(0.01, parameters[parameter] * dimensions.scale);
  const points: [number, number, number][] = radial ? [[-radius, y, 0], [radius, y, 0]] : [[offset, y - length / 2, 0], [offset, y + length / 2, 0]];
  const labelPosition: [number, number, number] = radial ? [0, y + 0.06, 0] : [offset + 0.08, y, 0];
  return <group>
    <Line points={points} color={color} lineWidth={2} depthTest={false} toneMapped={false} />
    {points.map((p, i) => <group key={i}><Line points={radial ? [[p[0], p[1], -0.06], [p[0], p[1], 0.06]] : [[p[0] - 0.06, p[1], 0], [p[0] + 0.06, p[1], 0]]} color={color} lineWidth={2} depthTest={false} toneMapped={false} /><AnnotationArrow tip={p} from={points[i === 0 ? 1 : 0]} /></group>)}
    <Html center position={labelPosition} style={{ pointerEvents: "none" }}><span role="status" aria-label="模型尺寸" className="whitespace-nowrap rounded border border-motor-annotation bg-card/95 px-2 py-1 text-[24px] font-medium text-motor-annotation">{radial ? "⌀ " : ""}{parameters[parameter]} mm</span></Html>
  </group>;
}
import type { CadPart } from "./step-model";
import type { MotorType } from "./motor-config";

function CadMesh({ part, color, opacity }: { part: CadPart; color: string; opacity: number }) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(part.mesh.attributes.position.array, 3));
    g.setIndex(part.mesh.index.array);
    if (part.mesh.attributes.normal) g.setAttribute("normal", new Float32BufferAttribute(part.mesh.attributes.normal.array, 3));
    else g.computeVertexNormals();
    return g;
  }, [part]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}><meshStandardMaterial color={color} metalness={0.55} roughness={0.36} side={DoubleSide} opacity={opacity} transparent={opacity < 1} depthWrite={opacity >= 1} /></mesh>;
}

export default function MotorViewer(props: { cadParts: CadPart[]; status: "loading" | "ready" | "error"; motorType: MotorType; parts: PartState; structure: StructureType; yokeType: StatorYokeType; parameters: MotorParameters; showDirection: boolean; showMesh: boolean; dimension: keyof MotorParameters | null; selected: PartTarget | null; instances: InstanceState; select: (part: PartTarget) => void; clearSelection: () => void; hovered: PartTarget | null; hover: (target: PartTarget | null) => void }) {
  const frame = useMemo(() => {
    const box = new Box3();
    props.cadParts.forEach(part => { const a = part.mesh.attributes.position.array; for (let i = 0; i < a.length; i += 3) box.expandByPoint(new Vector3(a[i], a[i + 1], a[i + 2])); });
    const center = box.isEmpty() ? new Vector3() : box.getCenter(new Vector3());
    const size = box.isEmpty() ? new Vector3(1, 1, 1) : box.getSize(new Vector3());
    return { scale: 2.5 / Math.max(size.x, size.y, size.z, 1), center };
  }, [props.cadParts]);
  const controls = useRef<OrbitControlsImpl>(null);
  const [ready, setReady] = useState(false);
  const [materials, setMaterials] = useState<{ colors: Record<string, string>; texture: CanvasTexture } | null>(null);
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const colors = Object.fromEntries(["steel", "tooth", "copper", "shaft", "light", "magnet", "highlight", "mesh", "annotation"].map((k) => [k, css.getPropertyValue(`--motor-${k}`).trim()]));
    colors.north = css.getPropertyValue("--motor-magnet-north").trim(); colors.south = css.getPropertyValue("--motor-magnet-south").trim();
    colors.phaseA = colors.copper;
    colors.phaseB = css.getPropertyValue("--motor-phase-b").trim();
    colors.phaseC = css.getPropertyValue("--motor-phase-c").trim();
    const canvas = document.createElement("canvas"); canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.fillStyle = colors.light; ctx.fillRect(0, 0, 128, 128); ctx.strokeStyle = colors.steel; ctx.globalAlpha = 0.25; ctx.lineWidth = 0.5; for (let i = 0; i < 128; i += 3) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke(); } }
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
    setMaterials({ colors, texture }); return () => texture.dispose();
  }, []);
  return <div className="relative h-full min-h-[340px] w-full" data-cad-parts={props.cadParts.length} data-motor-type={props.motorType} data-model-status={props.status} data-yoke={hasStatorYoke(props.structure, props.yokeType)} data-scene-ready={ready ? "true" : undefined} data-structure={props.structure} data-mesh={props.showMesh} data-dimension={props.dimension ?? ""} data-hidden-count={Object.values(props.instances).filter((p) => p.visible === false).length}>
    {materials && <Canvas onPointerMissed={(event) => { if (event.type === "click") props.clearSelection(); }} frameloop="demand" dpr={[1, 1.5]} camera={{ position: [3.8, 3.2, 4.2], fov: 38 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.2} /><directionalLight position={[3, 7, 5]} intensity={3} />
      <Environment resolution={64}><Lightformer intensity={3} color={materials.colors.light} position={[0, 5, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} /><Lightformer intensity={2} color={materials.colors.light} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} /></Environment>
      <group scale={frame.scale}><group position={[-frame.center.x, -frame.center.y, -frame.center.z]}>
        {props.cadParts.map(part => <InteractivePart key={part.id} target={{ key: part.key, id: part.id }} {...props} highlight={materials.colors.highlight} selectionColor={materials.colors.annotation} meshColor={materials.colors.mesh}><CadMesh part={part} color={part.key === "magnet" ? materials.colors.magnet : part.key === "winding" ? materials.colors[/B相|phase.?B/i.test(part.label) ? "phaseB" : /C相|phase.?C/i.test(part.label) ? "phaseC" : "phaseA"] : materials.colors.steel} opacity={props.parts[part.key].opacity} /></InteractivePart>)}
      </group></group>
      {props.dimension && props.status === "ready" && <DimensionAnnotation parameter={props.dimension} parameters={props.parameters} structure={props.structure} color={materials.colors.annotation} />}
      {props.showDirection && props.status === "ready" && props.cadParts.filter(part => part.key === "magnet").map((part, i) => {
        const box = new Box3(); const a = part.mesh.attributes.position.array;
        for (let j = 0; j < a.length; j += 3) box.expandByPoint(new Vector3(a[j], a[j + 1], a[j + 2]));
        const c = box.getCenter(new Vector3()).sub(frame.center).multiplyScalar(frame.scale);
        const start: [number, number, number] = [c.x, c.y - 1.5, c.z]; const end: [number, number, number] = [c.x, c.y + 1.5, c.z];
        return <group key={part.id}><Line points={i % 2 ? [end, start] : [start, end]} color={i % 2 ? materials.colors.south : materials.colors.north} lineWidth={2} dashed dashSize={0.045} gapSize={0.03} depthTest={false} /><AnnotationArrow tip={i % 2 ? start : end} from={i % 2 ? end : start} colorClass={i % 2 ? "fill-motor-south" : "fill-motor-north"} /></group>;
      })}
      <OrbitControls ref={controls} makeDefault enableDamping={false} minDistance={2.5} maxDistance={18} />
      <FitCamera />
      <ReadySignal onReady={() => setReady(true)} />
    </Canvas>}
    {props.status !== "ready" && <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] text-muted-foreground">{props.status === "loading" ? "正在加载工业模型…" : "工业模型加载失败"}</div>}
    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-[var(--shadow-card)]">
      <Button size="icon" variant="ghost" title="放大" aria-label="放大模型" onClick={() => { controls.current?.dollyIn(1.2); controls.current?.update(); }}><Plus /></Button>
      <Button size="icon" variant="ghost" title="缩小" aria-label="缩小模型" onClick={() => { controls.current?.dollyOut(1.2); controls.current?.update(); }}><Minus /></Button>
      <span className="mx-1 h-5 border-l border-border" />
      <Button size="icon" variant="ghost" title="重置视角" aria-label="重置视角" onClick={() => controls.current?.reset()}><RotateCcw /></Button>
      <Button size="icon" variant="ghost" title="轴测视图" aria-label="轴测视图" onClick={() => { const c = controls.current; if (c) { c.object.position.set(3.8, 3.2, 4.2); c.target.set(0, 0, 0); c.update(); } }}><Box /></Button>
    </div>
  </div>;
}