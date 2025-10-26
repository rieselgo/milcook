/**
 * 熱力学計算で使用する物理定数
 */

// 水の物理定数
export const WATER_DENSITY = 1000; // kg/m³
export const WATER_SPECIFIC_HEAT = 4186; // J/(kg·K)

// 熱伝達係数の基準値
export const NATURAL_CONVECTION_H = 10; // W/(m²·K) 自然対流
export const FORCED_CONVECTION_H = 50; // W/(m²·K) 強制対流

// 混合温度計算用
export const HOT_WATER_TEMP = 85; // °C (お湯の温度)

// 哺乳瓶の標準寸法（円筒近似）
export const BOTTLE_RADIUS = 0.035; // m (半径3.5cm = 直径7cm)

/**
 * ミルク量から哺乳瓶の高さを計算
 * @param volume ミルク量（ml）
 * @returns 高さ（m）
 */
export const calculateBottleHeight = (volume: number): number => {
  // V = πr²h より h = V / (πr²)
  // volume (ml) を m³ に変換: volume / 1000000
  const volumeM3 = volume / 1000000;
  return volumeM3 / (Math.PI * BOTTLE_RADIUS ** 2);
};

/**
 * 哺乳瓶の表面積を計算（側面のみ、底面と上面は無視）
 * @param volume ミルク量（ml）
 * @returns 表面積（m²）
 */
export const calculateBottleSurfaceArea = (volume: number): number => {
  const height = calculateBottleHeight(volume);
  // 円筒の側面積: 2πrh
  return 2 * Math.PI * BOTTLE_RADIUS * height;
};
