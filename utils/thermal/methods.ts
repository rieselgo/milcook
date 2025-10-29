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
    name: '氷水でまぜまぜ',
    description: '速くて節水、実用的',
    ambientTemp: 2, // °C (氷水の温度)
    velocity: 0.3, // m/s (攪拌による流速)
    baseH: 260, // W/(m²·K) 基準熱伝達係数（実測値ベース調整: 氷水静置の1.65倍）
    velocityFactor: 1.5,
    recommendedPriority: 2,
  },
  ice_still: {
    id: 'ice_still',
    name: '氷水でゆっくり',
    description: '放置できて楽',
    ambientTemp: 2, // °C (氷水の温度)
    velocity: 0, // m/s (静止)
    baseH: 158, // W/(m²·K) 自然対流のみ (実測値に基づき調整: 55°C→38°Cを約4分で冷却)
    velocityFactor: 1.0,
    recommendedPriority: 1, // デフォルト
  },
  water_still: {
    id: 'water_still',
    name: 'お水でゆっくり',
    description: '氷なしで冷やす',
    ambientTemp: 15, // °C (水道水の温度)
    velocity: 0, // m/s (静止)
    baseH: 145, // W/(m²·K) (実測値ベース調整: 氷水静置より若干遅い)
    velocityFactor: 1.0,
    recommendedPriority: 3,
  },
  air: {
    id: 'air',
    name: 'そのまま放置',
    description: '遅すぎる（非推奨）',
    ambientTemp: 20, // °C (室温)
    velocity: 0, // m/s (静止)
    baseH: 17, // W/(m²·K) 自然対流（空気）(62°C→38°Cを約60分で冷却)
    velocityFactor: 1.0,
    recommendedPriority: 4,
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
 * 推奨冷却方法（氷水静置）を取得
 * @returns 氷水静置の冷却方法オブジェクト
 */
export const getRecommendedMethod = (): CoolingMethod => {
  return COOLING_METHODS.ice_still;
};
