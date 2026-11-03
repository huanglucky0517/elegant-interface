import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { CanvasTexture, DoubleSide, ExtrudeGeometry, Path, Shape, SRGBColorSpace } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { RotateCcw, Minus, Plus, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { structureLayers, type MotorParameters, type PartKey, type PartState, type StructureType } from "./model-state";

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
  return <mesh geometry={geometry} position={[0, y, 0]} rotation={[0, rotation, 0]} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
    <meshStandardMaterial color={color} map={texture} metalness={0.72} roughness={0.34} transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= 1} side={DoubleSide} />
  </mesh>;
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
function Assembly({ parts, structure, parameters, showDirection, colors, texture, select }: {
  parts: PartState; structure: StructureType; parameters: MotorParameters; showDirection: boolean;
  colors: Record<string, string>; texture: CanvasTexture; select: (part: PartKey) => void;
}) {
  const layers = structureLayers(structure);
  const scale = 2.5 / Math.max(parameters.statorOuter, parameters.rotorOuter, 1);
  const outerS = Math.max(0.8, parameters.statorOuter * scale);
  const innerS = Math.min(outerS - 0.15, Math.max(0.2, parameters.statorInner * scale));
  const outerR = Math.max(0.8, parameters.rotorOuter * scale);
  const innerR = Math.min(outerR - 0.15, Math.max(0.2, parameters.rotorInner * scale));
  const slots = Math.min(72, Math.max(3, Math.round(parameters.slots)));
  const poles = Math.min(48, Math.max(2, Math.round(parameters.poles)));
  const spacing = 0.42 + Math.max(0, parameters.gap) * scale;
  return <group rotation={[0.12, 0.35, 0]}>
    {layers.stators.map((layer, index) => <group key={`stator-${index}`}>
      {parts.stator.visible && <group>
        <AnnularPart inner={innerS} outer={outerS} height={0.14} y={layer * spacing} color={colors.steel} opacity={parts.stator.opacity} texture={texture} onClick={() => select("stator")} />
        {Array.from({ length: slots }, (_, i) => <AnnularPart key={i} inner={innerS + 0.02} outer={outerS - 0.02} height={0.30} angle={Math.PI * 2 / slots * 0.43} rotation={i * Math.PI * 2 / slots} y={layer * spacing} color={colors.tooth} opacity={parts.stator.opacity} texture={texture} onClick={() => select("stator")} />)}
      </group>}
      {parts.winding.visible && Array.from({ length: slots }, (_, i) => <group key={i} rotation={[0, (i + 0.47) * Math.PI * 2 / slots, 0]}>
        {Array.from({ length: 5 }, (_, j) => <AnnularPart key={j} inner={innerS + 0.055 + j * 0.008} outer={outerS - 0.055 - j * 0.008} height={0.043} angle={Math.PI * 2 / slots * 0.44} y={layer * spacing - 0.13 + j * 0.065} color={colors.copper} opacity={parts.winding.opacity} onClick={() => select("winding")} />)}
      </group>)}
    </group>)}
    {layers.rotors.map((layer, index) => <group key={`rotor-${index}`}>
      {parts.rotor.visible && <AnnularPart inner={innerR} outer={outerR} height={0.14} y={layer * spacing} color={colors.steel} opacity={parts.rotor.opacity} texture={texture} onClick={() => select("rotor")} />}
      {parts.magnet.visible && Array.from({ length: poles }, (_, i) => <group key={i}>
        <AnnularPart inner={Math.max(innerR + 0.06, innerS)} outer={Math.min(outerR - 0.08, outerS)} height={0.09} angle={Math.PI * 2 / poles * 0.88} rotation={i * Math.PI * 2 / poles} y={layer * spacing + (layer > 0 ? -0.13 : 0.13)} color={i % 2 ? colors.south : colors.north} opacity={parts.magnet.opacity} onClick={() => select("magnet")} />
        {showDirection && <group position={[Math.cos(-(i + 0.44) * Math.PI * 2 / poles) * (innerS + outerS) / 2, layer * spacing + 0.23, Math.sin(-(i + 0.44) * Math.PI * 2 / poles) * (innerS + outerS) / 2]} rotation={[i % 2 ? Math.PI : 0, 0, 0]}>
          <mesh><cylinderGeometry args={[0.012, 0.012, 0.16, 8]} /><meshBasicMaterial color={colors.light} /></mesh>
          <mesh position={[0, 0.1, 0]}><coneGeometry args={[0.035, 0.07, 12]} /><meshBasicMaterial color={colors.light} /></mesh>
        </group>}
      </group>)}
    </group>)}
    {parts.rotor.visible && <group onClick={(e) => { e.stopPropagation(); select("rotor"); }}>
      <mesh><cylinderGeometry args={[0.18, 0.18, 1.6, 48]} /><meshStandardMaterial color={colors.shaft} metalness={0.85} roughness={0.23} transparent={parts.rotor.opacity < 1} opacity={parts.rotor.opacity} depthWrite={parts.rotor.opacity >= 1} /></mesh>
      <mesh><cylinderGeometry args={[0.36, 0.36, 0.65, 48]} /><meshStandardMaterial color={colors.steel} metalness={0.75} roughness={0.32} transparent={parts.rotor.opacity < 1} opacity={parts.rotor.opacity} depthWrite={parts.rotor.opacity >= 1} /></mesh>
    </group>}
  </group>;
}
export default function MotorViewer(props: { parts: PartState; structure: StructureType; parameters: MotorParameters; showDirection: boolean; select: (part: PartKey) => void }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [ready, setReady] = useState(false);
  const [materials, setMaterials] = useState<{ colors: Record<string, string>; texture: CanvasTexture } | null>(null);
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const colors = Object.fromEntries(["steel", "tooth", "copper", "shaft", "light"].map((k) => [k, css.getPropertyValue(`--motor-${k}`).trim()]));
    colors.north = css.getPropertyValue("--motor-magnet-north").trim(); colors.south = css.getPropertyValue("--motor-magnet-south").trim();
    const canvas = document.createElement("canvas"); canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.fillStyle = colors.tooth; ctx.fillRect(0, 0, 128, 128); ctx.strokeStyle = colors.steel; ctx.lineWidth = 0.5; for (let i = 0; i < 128; i += 3) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke(); } }
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
    setMaterials({ colors, texture }); return () => texture.dispose();
  }, []);
  return <div className="relative h-full min-h-[340px] w-full" data-scene-ready={ready ? "true" : undefined} data-structure={props.structure}>
    {materials && <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [6.4, 5.4, 7], fov: 38 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.2} /><directionalLight position={[3, 7, 5]} intensity={3} />
      <Environment resolution={64}><Lightformer intensity={3} color={materials.colors.light} position={[0, 5, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} /><Lightformer intensity={2} color={materials.colors.light} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} /></Environment>
      <Assembly {...props} {...materials} />
      <OrbitControls ref={controls} makeDefault enableDamping={false} minDistance={5} maxDistance={18} />
      <FitCamera />
      <ReadySignal onReady={() => setReady(true)} />
    </Canvas>}
    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-[var(--shadow-card)]">
      <Button size="icon" variant="ghost" title="放大" aria-label="放大模型" onClick={() => { controls.current?.dollyIn(1.2); controls.current?.update(); }}><Plus /></Button>
      <Button size="icon" variant="ghost" title="缩小" aria-label="缩小模型" onClick={() => { controls.current?.dollyOut(1.2); controls.current?.update(); }}><Minus /></Button>
      <span className="mx-1 h-5 border-l border-border" />
      <Button size="icon" variant="ghost" title="重置视角" aria-label="重置视角" onClick={() => controls.current?.reset()}><RotateCcw /></Button>
      <Button size="icon" variant="ghost" title="轴测视图" aria-label="轴测视图" onClick={() => { const c = controls.current; if (c) { c.object.position.set(6.4, 5.4, 7); c.target.set(0, 0, 0); c.update(); } }}><Box /></Button>
    </div>
  </div>;
}