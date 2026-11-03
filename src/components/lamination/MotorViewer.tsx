import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, Line, Html } from "@react-three/drei";
import { CanvasTexture, DoubleSide, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Shape, SRGBColorSpace, EdgesGeometry, WireframeGeometry, LineBasicMaterial, LineSegments, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { RotateCcw, Minus, Plus, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HIGHLIGHT_OPACITY, effectivePart, motorDimensions, isPartHighlighted, structureLayers, type InstanceState, type PartTarget, type MotorParameters, type PartKey, type PartState, type StructureType } from "./model-state";

function sectorGeometry(inner: number, outer: number, height: number, angle = Math.PI * 2) {
  const shape = new Shape();
  if (angle >= Math.PI * 2) {
    shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
    const hole = new Path(); hole.absarc(0, 0, inner, 0, Math.PI * 2, true); shape.holes.push(hole);
  } else {
    shape.moveTo(inner, 0); shape.lineTo(outer, 0); shape.absarc(0, 0, outer, 0, angle, false);
    shape.lineTo(inner * Math.cos(angle), inner * Math.sin(angle)); shape.absarc(0, 0, inner, angle, 0, true); shape.closePath();
  }
  const geometry = new ExtrudeGeometry(shape, { depth: height, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.012, bevelThickness: 0.012, curveSegments: 64 });
  geometry.rotateX(-Math.PI / 2); geometry.translate(0, -height / 2, 0); return geometry;
}
function AnnularPart({ inner, outer, height, angle, color, opacity, y, rotation = 0, texture, onClick }: {
  inner: number; outer: number; height: number; angle?: number; color: string; opacity: number;
  y: number; rotation?: number; texture?: CanvasTexture; onClick?: () => void;
}) {
  const geometry = useMemo(() => sectorGeometry(inner, outer, height, angle), [inner, outer, height, angle]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={[0, y, 0]} rotation={[0, rotation, 0]}>
    <meshStandardMaterial color={color} map={texture} metalness={0.72} roughness={0.34} transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= 1} side={DoubleSide} />
  </mesh>;
}
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
        material.depthTest = !active;
        material.emissive.set(fillColor); material.emissiveIntensity = active ? 0.3 : 0;
        material.needsUpdate = true;
        cleanup.push(() => { material.copy(original); original.dispose(); });
      });
      if (active || showMesh) {
        const geometry = active ? new EdgesGeometry(mesh.geometry, 25) : new WireframeGeometry(mesh.geometry);
        const material = new LineBasicMaterial({ color: active ? highlight : meshColor, transparent: true, opacity: active ? 1 : 0.45, depthTest: !active, toneMapped: false });
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
function Assembly({ parts, structure, parameters, showDirection, showMesh, dimension, selected, instances, colors, texture, select, hovered, hover }: {
  parts: PartState; structure: StructureType; parameters: MotorParameters; showDirection: boolean;
  colors: Record<string, string>; texture: CanvasTexture; select: (part: PartTarget) => void;
  selected: PartTarget | null; instances: InstanceState; showMesh: boolean; dimension: keyof MotorParameters | null;
  hovered: PartTarget | null; hover: (target: PartTarget | null) => void;
}) {
  const layers = structureLayers(structure);
  const { scale, outerS, innerS, outerR, innerR, statorHeight, rotorHeight } = motorDimensions(parameters);
  const slots = Math.min(72, Math.max(3, Math.round(parameters.slots)));
  const poles = Math.min(48, Math.max(2, Math.round(parameters.poles)));
  const spacing = (statorHeight + rotorHeight) / 2 + Math.max(0, parameters.gap) * scale;
  const part = (key: PartKey, id: string, children: ReactNode) => <InteractivePart key={id} target={{ key, id }} hovered={hovered} selected={selected} instances={instances} parts={parts} showMesh={showMesh} meshColor={colors.mesh} hover={hover} select={select} highlight={colors.highlight} selectionColor={colors.annotation}>{children}</InteractivePart>;
  return <group rotation={[0.12, 0.35, 0]}>
    {layers.stators.map((layer, index) => <group key={`stator-${index}`}>
      {parts.stator.visible && <group>
        {part("stator", `core-${index}`, <AnnularPart inner={innerS} outer={outerS} height={Math.max(0.015, parameters.yokeHeight * scale)} y={layer * spacing - statorHeight / 2 + parameters.yokeHeight * scale / 2} color={colors.steel} opacity={parts.stator.opacity} texture={texture} />)}
        {Array.from({ length: slots }, (_, i) => part("stator", `tooth-${index}-${i}`, <AnnularPart inner={innerS + 0.02} outer={outerS - 0.02} height={statorHeight} angle={Math.max(0.02, Math.PI * 2 / slots - parameters.slotWidth * scale / ((innerS + outerS) / 2))} rotation={i * Math.PI * 2 / slots} y={layer * spacing} color={colors.tooth} opacity={parts.stator.opacity} texture={texture} />))}
      </group>}
      {parts.winding.visible && Array.from({ length: slots }, (_, i) => part("winding", `coil-${index}-${i}`, <group rotation={[0, (i + 0.47) * Math.PI * 2 / slots, 0]}>
        {Array.from({ length: 5 }, (_, j) => <AnnularPart key={j} inner={innerS + 0.055 + j * 0.008} outer={outerS - 0.055 - j * 0.008} height={Math.max(0.008, statorHeight / 7)} angle={Math.PI * 2 / slots * 0.44} y={layer * spacing - statorHeight * 0.4 + j * statorHeight / 5} color={colors.copper} opacity={parts.winding.opacity}  />)}
      </group>))}
    </group>)}
    {layers.rotors.map((layer, index) => <group key={`rotor-${index}`}>
      {parts.rotor.visible && part("rotor", `rotor-${index}`, <AnnularPart inner={innerR} outer={outerR} height={Math.max(0.015, parameters.backIron * scale)} y={layer * spacing} color={colors.steel} opacity={parts.rotor.opacity} texture={texture} />)}
      {parts.magnet.visible && Array.from({ length: poles }, (_, i) => part("magnet", `magnet-${index}-${i}`, <group>
        <AnnularPart inner={Math.max(innerR, Math.min(outerR - 0.03, parameters.magnetInner * scale / 2))} outer={Math.max(innerR + 0.03, Math.min(outerR, parameters.magnetOuter * scale / 2))} height={Math.max(0.015, rotorHeight - parameters.backIron * scale)} angle={Math.max(0.02, Math.PI * 2 / poles * Math.min(1, Math.max(0.1, parameters.poleRatio * 1.76)) - parameters.magnetSpacing * scale / ((innerR + outerR) / 2))} rotation={i * Math.PI * 2 / poles} y={layer * spacing + (layer > 0 ? -rotorHeight / 2 : rotorHeight / 2)} color={colors.magnet} opacity={parts.magnet.opacity} />

      </group>))}
    </group>)}
    {showDirection && Array.from({ length: poles }, (_, i) => {
      const radius = (innerS + outerS) / 2;
      const angle = -(i + 0.44) * Math.PI * 2 / poles;
      const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
      const extent = Math.max(...layers.rotors.map(Math.abs), ...layers.stators.map(Math.abs)) * spacing + statorHeight + 0.35;
      const start: [number, number, number] = [x, i % 2 ? extent : -extent, z];
      const end: [number, number, number] = [x, i % 2 ? -extent : extent, z];
      return <group key={`flux-${i}`}><Line points={[start, end]} color={i % 2 ? colors.south : colors.north} lineWidth={2} dashed dashSize={0.045} gapSize={0.03} depthTest={false} toneMapped={false} /><AnnotationArrow tip={end} from={start} colorClass={i % 2 ? "fill-motor-south" : "fill-motor-north"} /></group>;
    })}
    {dimension && <DimensionAnnotation parameter={dimension} parameters={parameters} structure={structure} color={colors.annotation} />}
    {parts.rotor.visible && <group>
      {part("rotor", "shaft", <mesh><cylinderGeometry args={[0.18, 0.18, Math.max(0.7, spacing * 2 + statorHeight + 0.2), 48]} /><meshStandardMaterial color={colors.steel} metalness={0.85} roughness={0.23} transparent={parts.rotor.opacity < 1} opacity={parts.rotor.opacity} depthWrite={parts.rotor.opacity >= 1} /></mesh>)}
      {part("rotor", "hub", <mesh><cylinderGeometry args={[0.36, 0.36, Math.max(0.2, spacing * 2 - rotorHeight), 48]} /><meshStandardMaterial color={colors.steel} metalness={0.75} roughness={0.32} transparent={parts.rotor.opacity < 1} opacity={parts.rotor.opacity} depthWrite={parts.rotor.opacity >= 1} /></mesh>)}
    </group>}
  </group>;
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
export default function MotorViewer(props: { parts: PartState; structure: StructureType; parameters: MotorParameters; showDirection: boolean; showMesh: boolean; dimension: keyof MotorParameters | null; selected: PartTarget | null; instances: InstanceState; select: (part: PartTarget) => void; clearSelection: () => void; hovered: PartTarget | null; hover: (target: PartTarget | null) => void }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [ready, setReady] = useState(false);
  const [materials, setMaterials] = useState<{ colors: Record<string, string>; texture: CanvasTexture } | null>(null);
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const colors = Object.fromEntries(["steel", "tooth", "copper", "shaft", "light", "magnet", "highlight", "mesh", "annotation"].map((k) => [k, css.getPropertyValue(`--motor-${k}`).trim()]));
    colors.north = css.getPropertyValue("--motor-magnet-north").trim(); colors.south = css.getPropertyValue("--motor-magnet-south").trim();
    const canvas = document.createElement("canvas"); canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.fillStyle = colors.light; ctx.fillRect(0, 0, 128, 128); ctx.strokeStyle = colors.steel; ctx.globalAlpha = 0.25; ctx.lineWidth = 0.5; for (let i = 0; i < 128; i += 3) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke(); } }
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
    setMaterials({ colors, texture }); return () => texture.dispose();
  }, []);
  return <div className="relative h-full min-h-[340px] w-full" data-scene-ready={ready ? "true" : undefined} data-structure={props.structure} data-mesh={props.showMesh} data-dimension={props.dimension ?? ""} data-hidden-count={Object.values(props.instances).filter((p) => p.visible === false).length}>
    {materials && <Canvas onPointerMissed={(event) => { if (event.type === "click") props.clearSelection(); }} frameloop="demand" dpr={[1, 1.5]} camera={{ position: [3.8, 3.2, 4.2], fov: 38 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.2} /><directionalLight position={[3, 7, 5]} intensity={3} />
      <Environment resolution={64}><Lightformer intensity={3} color={materials.colors.light} position={[0, 5, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} /><Lightformer intensity={2} color={materials.colors.light} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} /></Environment>
      <Assembly {...props} {...materials} />
      <OrbitControls ref={controls} makeDefault enableDamping={false} minDistance={2.5} maxDistance={18} />
      <FitCamera />
      <ReadySignal onReady={() => setReady(true)} />
    </Canvas>}
    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-[var(--shadow-card)]">
      <Button size="icon" variant="ghost" title="放大" aria-label="放大模型" onClick={() => { controls.current?.dollyIn(1.2); controls.current?.update(); }}><Plus /></Button>
      <Button size="icon" variant="ghost" title="缩小" aria-label="缩小模型" onClick={() => { controls.current?.dollyOut(1.2); controls.current?.update(); }}><Minus /></Button>
      <span className="mx-1 h-5 border-l border-border" />
      <Button size="icon" variant="ghost" title="重置视角" aria-label="重置视角" onClick={() => controls.current?.reset()}><RotateCcw /></Button>
      <Button size="icon" variant="ghost" title="轴测视图" aria-label="轴测视图" onClick={() => { const c = controls.current; if (c) { c.object.position.set(3.8, 3.2, 4.2); c.target.set(0, 0, 0); c.update(); } }}><Box /></Button>
    </div>
  </div>;
}