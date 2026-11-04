import { describe, it, expect } from 'vitest';
import { MOTOR_TYPES, initialMotorConfigs } from './motor-config';
import { stepPayload } from './step-export';
import { cadParts } from './step-model';

describe('工业电机类型切换', () => {
  it('选择冲片支持轴向磁通电机与同步电机', () => {
    expect(MOTOR_TYPES).toEqual(['轴向磁通电机', '同步电机']);
  });
  it('两个类型使用独立尺寸，编辑一个不会改动另一个', () => {
    const configs = initialMotorConfigs();
    const before = configs['同步电机'].parameters.statorOuter;
    configs['轴向磁通电机'].parameters.statorOuter = 400;
    expect(configs['同步电机'].parameters.statorOuter).toBe(before);
    expect(configs['同步电机'].parameters.rotorOuter).not.toBe(configs['轴向磁通电机'].parameters.rotorOuter);
  });
  it('API 请求传递所选电机类型和其当前数值与下拉参数', () => {
    const configs = initialMotorConfigs();
    const config = configs['同步电机'];
    const payload = stepPayload({ ...config.parameters, statorOuter: 400 }, config.structure, config.yokeType, '同步电机', { ...config.details, magnetMaterial: 'N48' });
    expect(payload).toMatchObject({ motorType: '同步电机', topology: 'radial_flux', statorOuter: 400, rotorOuter: config.parameters.rotorOuter, magnetMaterial: 'N48' });
  });
  it('零部件来自 STEP 实际实体，未识别名称不伪造分类', () => {
    const mesh = (name: string) => ({ name, attributes: { position: { array: [0, 0, 0, 1, 0, 0, 0, 1, 0] } }, index: { array: [0, 1, 2] } });
    const parts = cadParts({ success: true, root: { name: '', meshes: [], children: [] }, meshes: [mesh('Stator'), mesh('Rotor'), mesh('Magnet'), mesh('Coil'), mesh('Unnamed')] });
    expect(parts.map(p => p.key)).toEqual(['stator', 'rotor', 'magnet', 'winding', 'other']);
    expect(parts.map(p => p.id)).toEqual(['cad-0', 'cad-1', 'cad-2', 'cad-3', 'cad-4']);
  });
});