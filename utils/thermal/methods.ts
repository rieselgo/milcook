import type { CoolingMethod } from '~/types/thermal';

/**
 * 冷却方法のパラメータ
 *
 * 各冷却方法の周囲温度、流速、熱伝達係数を定義
 * これらの値は冷却速度の予測に使用される
 */
export const COOLING_METHODS: Record<string, CoolingMethod> = {
  ice_stir: {
    id: 'ice_stir',
    name: '氷水攪拌',
    description: '速くて節水、実用的',
    ambientTemp: 2, // °C (氷水の温度)
    velocity: 0.3, // m/s (攪拌による流速)
    baseH: 1500, // W/(m²·K) 基準熱伝達係数 (調整済み)
    velocityFactor: 1.5, // 流速による補正係数
    recommendedPriority: 1, // 最推奨
  },
  ice_still: {
    id: 'ice_still',
    name: '氷水静置',
    description: '放置できて楽',
    ambientTemp: 2, // °C
    velocity: 0, // m/s (静止)
    baseH: 300, // W/(m²·K) 自然対流のみ (調整済み)
    velocityFactor: 1.0,
    recommendedPriority: 2,
  },
  running_water: {
    id: 'running_water',
    name: '流水冷却',
    description: '速いが水道代',
    ambientTemp: 15, // °C (水道水の温度)
    velocity: 0.5, // m/s (流水)
    baseH: 2000, // W/(m²·K) (調整済み)
    velocityFactor: 2.0,
    recommendedPriority: 3,
  },
  ice_water_running: {
    id: 'ice_water_running',
    name: '氷水+流水',
    description: '最速',
    ambientTemp: 5, // °C
    velocity: 0.7, // m/s
    baseH: 2500, // W/(m²·K) (調整済み)
    velocityFactor: 2.5,
    recommendedPriority: 4,
  },
  air: {
    id: 'air',
    name: '常温放置',
    description: '遅すぎる（非推奨）',
    ambientTemp: 20, // °C (室温)
    velocity: 0, // m/s
    baseH: 10, // W/(m²·K) 自然対流（空気）
    velocityFactor: 1.0,
    recommendedPriority: 5, // 非推奨
  },
};

/**
 * 冷却方法IDから冷却方法オブジェクトを取得
 * @param id 冷却方法ID
 * @returns 冷却方法オブジェクト
 * @throws 存在しないIDの場合はエラー
 */
export const getCoolingMethod = (id: string): CoolingMethod => {
  const method = COOLING_METHODS[id];
  if (!method) {
    throw new Error(`Unknown cooling method ID: ${id}`);
  }
  return method;
};

/**
 * 全冷却方法のリストを取得（推奨順にソート）
 * @returns 冷却方法オブジェクトの配列
 */
export const getAllCoolingMethods = (): CoolingMethod[] => {
  return Object.values(COOLING_METHODS).sort(
    (a, b) => a.recommendedPriority - b.recommendedPriority
  );
};

/**
 * 推奨冷却方法（氷水攪拌）を取得
 * @returns 氷水攪拌の冷却方法オブジェクト
 */
export const getRecommendedMethod = (): CoolingMethod => {
  return COOLING_METHODS.ice_stir;
};
