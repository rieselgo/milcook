import type { BottleMaterial } from '~/types/thermal';

/**
 * 哺乳瓶の材質パラメータ
 *
 * 各材質の熱伝導率、厚さ、密度、比熱を定義
 * これらの値は冷却速度に影響を与える
 */
export const MATERIALS: Record<string, BottleMaterial> = {
  glass: {
    id: 'glass',
    name: 'ガラス',
    thermalConductivity: 1.0, // W/(m·K) - ガラスの熱伝導率
    thickness: 0.002, // m (2mm)
    density: 2500, // kg/m³
    specificHeat: 840, // J/(kg·K)
  },
  plastic: {
    id: 'plastic',
    name: 'プラスチック',
    thermalConductivity: 0.2, // W/(m·K) - プラスチックは熱伝導率が低い
    thickness: 0.003, // m (3mm) - ガラスより厚い
    density: 1200, // kg/m³
    specificHeat: 1200, // J/(kg·K)
  },
  ppsu: {
    id: 'ppsu',
    name: 'PPSU',
    thermalConductivity: 0.26, // W/(m·K) - プラスチックより少し高い
    thickness: 0.003, // m (3mm)
    density: 1290, // kg/m³
    specificHeat: 1100, // J/(kg·K)
  },
};

/**
 * 材質IDから材質オブジェクトを取得
 * @param id 材質ID ('glass' | 'plastic' | 'ppsu')
 * @returns 材質オブジェクト
 * @throws 存在しないIDの場合はエラー
 */
export const getMaterial = (id: string): BottleMaterial => {
  const material = MATERIALS[id];
  if (!material) {
    throw new Error(`Unknown material ID: ${id}`);
  }
  return material;
};

/**
 * 全材質のリストを取得
 * @returns 材質オブジェクトの配列
 */
export const getAllMaterials = (): BottleMaterial[] => {
  return Object.values(MATERIALS);
};
