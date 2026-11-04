/* OpenCascade performs STEP tessellation away from the UI thread. */
importScripts('/cad/occt-import-js.js');
const engine = occtimportjs({ locateFile: name => '/cad/' + name });
self.onmessage = async event => {
  try {
    const occt = await engine;
    const result = occt.ReadStepFile(new Uint8Array(event.data), {
      linearUnit: 'millimeter', linearDeflectionType: 'absolute_value',
      linearDeflection: 0.1, angularDeflection: 0.3,
    });
    if (!result.success || !result.meshes?.length) throw new Error('STEP 文件不含可显示的有效实体');
    self.postMessage({ result });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};