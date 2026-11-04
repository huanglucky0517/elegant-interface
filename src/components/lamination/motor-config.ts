import { INITIAL_PARAMETERS, STATOR_DETAILS, ROTOR_DETAILS, type MotorParameters, type StructureType, type StatorYokeType } from './model-state';

export const MOTOR_TYPES = ['轴向磁通电机', '同步电机'] as const;
export type MotorType = (typeof MOTOR_TYPES)[number];
export type DetailValues = Record<string, string>;
export interface MotorConfig { parameters: MotorParameters; structure: StructureType; yokeType: StatorYokeType; details: DetailValues }
export function initialMotorConfigs(): Record<MotorType, MotorConfig> {
  const details = () => Object.fromEntries([...STATOR_DETAILS, ...ROTOR_DETAILS].map(p => [p.key, p.value]));
  return {
    '轴向磁通电机': { parameters: { ...INITIAL_PARAMETERS }, structure: '单定子双转子', yokeType: '有定子轭', details: details() },
    // Editable example dimensions, not a validated industrial design.
    '同步电机': { parameters: { ...INITIAL_PARAMETERS, slots: 48, statorInner: 224, rotorOuter: 222, rotorInner: 80, statorHeight: 120, rotorHeight: 120, gap: 1, magnetOuter: 220, magnetInner: 180 }, structure: '单定子单转子', yokeType: '有定子轭', details: { ...details(), magnetShape: '矩形磁钢' } },
  };
}