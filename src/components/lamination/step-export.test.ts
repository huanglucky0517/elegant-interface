import { afterEach, describe, expect, it, vi } from "vitest";
import { INITIAL_PARAMETERS } from "./model-state";
import { requestStep, stepPayload, STEP_ENDPOINT, STEP_FILENAME, reportStepError } from "./step-export";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe("自动 STEP 导出", () => {
  const payload = stepPayload(INITIAL_PARAMETERS, "单定子双转子", "有定子轭");
  it("传递当前结构与定子外径等冲片尺寸", () => {
    const changed = stepPayload({ ...INITIAL_PARAMETERS, statorOuter: 400 }, "单定子双转子", "无定子轭");
    expect(changed).toMatchObject({ statorOuter: 400, toothOuter: 400, rotorOuter: 350, gap: 0.7, poles: 8, slots: 27, structure: "单定子双转子", yokeType: "无定子轭" });
  });
  it("向指定本地地址 POST JSON 并完整保留二进制字节", async () => {
    const bytes = new Uint8Array([73, 83, 79, 0, 255, 10]);
    const fetchMock = vi.fn().mockResolvedValue(new Response(bytes, { headers: { "Content-Type": "application/octet-stream" } }));
    vi.stubGlobal("fetch", fetchMock);
    const blob = await requestStep(payload);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/generate-step", expect.objectContaining({ method: "POST", body: JSON.stringify(payload), headers: expect.objectContaining({ "Content-Type": "application/json" }) }));
    expect(new Uint8Array(await blob.arrayBuffer())).toEqual(bytes);
    expect(STEP_FILENAME).toBe("motor_design.step");
  });
  it("HTTP 失败时拒绝下载", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("error", { status: 500 })));
    await expect(requestStep(payload)).rejects.toThrow("HTTP 500");
  });
  it("拒绝空文件", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null)));
    await expect(requestStep(payload)).rejects.toThrow("空文件");
  });
  it("拒绝被误当作文件的 JSON 错误", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "failed" })));
    await expect(requestStep(payload)).rejects.toThrow("预期为 STEP 文件流");
  });
  it("连接失败输出服务地址和启动提示", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    reportStepError(new TypeError("Failed to fetch"));
    expect(log).toHaveBeenCalledWith(expect.stringContaining(STEP_ENDPOINT));
    expect(log).toHaveBeenCalledWith(expect.stringContaining("后端已启动"));
  });
});