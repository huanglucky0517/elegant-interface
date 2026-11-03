import { describe, expect, it } from "vitest";
import { INITIAL_PARTS, INITIAL_PARAMETERS, partComponents, isPartHighlighted, structureLayers, setPartVisibility, setPartTransparency } from "./model-state";
describe("轴向磁通结构", () => {
  it("单定子单转子具有一个定子一个转子", () => { const s = structureLayers("单定子单转子"); expect(s.stators).toHaveLength(1); expect(s.rotors).toHaveLength(1); });
  it("双定子单转子具有两个定子一个转子", () => { const s = structureLayers("双定子单转子"); expect(s.stators).toHaveLength(2); expect(s.rotors).toHaveLength(1); });
  it("单定子双转子具有一个定子两个转子", () => { const s = structureLayers("单定子双转子"); expect(s.stators).toHaveLength(1); expect(s.rotors).toHaveLength(2); });
  it("隐藏转子不隐藏定子、磁钢、绕组", () => { const p = setPartVisibility(INITIAL_PARTS, "rotor", false); expect(p.rotor.visible).toBe(false); expect(p.stator.visible && p.magnet.visible && p.winding.visible).toBe(true); });
  it("50%透明度仅改变选中零部件", () => { const p = setPartTransparency(INITIAL_PARTS, "stator", 50); expect(p.stator.opacity).toBe(0.5); expect(p.rotor.opacity).toBe(1); expect(INITIAL_PARTS.stator.opacity).toBe(1); });
  it("100%透明度使零部件完全透明", () => { expect(setPartTransparency(INITIAL_PARTS, "magnet", 100).magnet.opacity).toBe(0); });
  it("分类悬浮高亮该分类而不高亮其他分类", () => { expect(isPartHighlighted({ key: "magnet" }, "magnet", "magnet-0-2")).toBe(true); expect(isPartHighlighted({ key: "magnet" }, "stator", "core-0")).toBe(false); });
  it("分部件悬浮仅高亮对应实体", () => { expect(isPartHighlighted({ key: "magnet", id: "magnet-0-2" }, "magnet", "magnet-0-2")).toBe(true); expect(isPartHighlighted({ key: "magnet", id: "magnet-0-2" }, "magnet", "magnet-0-3")).toBe(false); });
  it("双转子8极显示16个磁钢分部件", () => { expect(partComponents("magnet", "单定子双转子", INITIAL_PARAMETERS)).toHaveLength(16); });
  it("27槽显示27个线圈分部件", () => { expect(partComponents("winding", "单定子双转子", INITIAL_PARAMETERS)).toHaveLength(27); });
});