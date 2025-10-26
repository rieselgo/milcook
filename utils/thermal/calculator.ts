import type { BottleMaterial, CoolingMethod } from '~/types/thermal';
import {
  WATER_DENSITY,
  WATER_SPECIFIC_HEAT,
  calculateBottleSurfaceArea,
} from './constants';

/**
 * ニュートンの冷却法則による温度計算
 *
 * T(t) = T_ambient + (T_initial - T_ambient) * exp(-k * t)
 *
 * @param initialTemp 初期温度（°C）
 * @param elapsedTime 経過時間（分）
 * @param ambient 周囲温度（°C）
 * @param k 冷却定数（1/分）
 * @returns 計算された温度（°C）
 */
export const calculateNewtonCooling = (
  initialTemp: number,
  elapsedTime: number,
  ambient: number,
  k: number
): number => {
  return ambient + (initialTemp - ambient) * Math.exp(-k * elapsedTime);
};

/**
 * 熱伝達係数の計算
 *
 * 流速に応じて熱伝達係数を調整
 * h = baseH * sqrt(velocity / velocity_ref + 1)
 *
 * @param method 冷却方法
 * @returns 熱伝達係数（W/(m²·K)）
 */
const calculateHeatTransferCoefficient = (method: CoolingMethod): number => {
  const velocityRef = 0.1; // 基準流速 (m/s)
  return method.baseH * Math.sqrt(method.velocity / velocityRef + 1);
};

/**
 * 冷却定数kの計算
 *
 * k = (h * A) / (m * c) * material_factor
 *
 * h: 熱伝達係数 (W/(m²·K))
 * A: 表面積 (m²)
 * m: 質量 (kg)
 * c: 比熱 (J/(kg·K))
 * material_factor: 材質による補正係数 (ガラス > PPSU > プラスチック)
 *
 * @param volume ミルク量（ml）
 * @param material 哺乳瓶の材質
 * @param method 冷却方法
 * @returns 冷却定数（1/分）
 */
export const calculateCoolingConstant = (
  volume: number,
  material: BottleMaterial,
  method: CoolingMethod
): number => {
  // 質量計算 (kg)
  const mass = (volume / 1000) * WATER_DENSITY;

  // 表面積計算 (m²)
  const area = calculateBottleSurfaceArea(volume);

  // 熱伝達係数 (W/(m²·K))
  const h = calculateHeatTransferCoefficient(method);

  // 材質による補正係数（熱伝導率に比例）
  // ガラスを基準(1.0)として、他の材質の相対的な熱伝導率
  const materialFactor = material.thermalConductivity;

  // 冷却定数 (1/秒)
  const kPerSecond = (h * area * materialFactor) / (mass * WATER_SPECIFIC_HEAT);

  // 1/分に変換
  return kPerSecond * 60;
};

/**
 * 目標温度到達時間の計算
 *
 * t = -ln((T_target - T_ambient) / (T_initial - T_ambient)) / k
 *
 * @param initialTemp 初期温度（°C）
 * @param targetTemp 目標温度（°C）
 * @param ambient 周囲温度（°C）
 * @param k 冷却定数（1/分）
 * @returns 到達時間（分）、到達不可能な場合はInfinity
 */
export const calculateTimeToTarget = (
  initialTemp: number,
  targetTemp: number,
  ambient: number,
  k: number
): number => {
  // 初期温度が目標温度以下の場合、すでに到達している
  if (initialTemp <= targetTemp) {
    return 0;
  }

  // 目標温度が周囲温度以下の場合、到達不可能
  if (targetTemp <= ambient) {
    return Infinity;
  }

  const ratio = (targetTemp - ambient) / (initialTemp - ambient);

  // 比率が0以下の場合、到達不可能
  if (ratio <= 0) {
    return Infinity;
  }

  // 時間計算（分）
  return -Math.log(ratio) / k;
};

/**
 * 混合温度の計算（お湯と湯冷ましを混ぜた時の温度）
 *
 * T_mix = (T_hot * V_hot + T_cold * V_cold) / (V_hot + V_cold)
 *
 * @param hotWaterTemp お湯の温度（°C）
 * @param hotWaterVolume お湯の量（ml）
 * @param coldWaterTemp 湯冷ましの温度（°C）
 * @param coldWaterVolume 湯冷ましの量（ml）
 * @returns 混合後の温度（°C）
 */
export const calculateMixedTemperature = (
  hotWaterTemp: number,
  hotWaterVolume: number,
  coldWaterTemp: number,
  coldWaterVolume: number
): number => {
  const totalVolume = hotWaterVolume + coldWaterVolume;
  return (hotWaterTemp * hotWaterVolume + coldWaterTemp * coldWaterVolume) / totalVolume;
};

/**
 * 目標混合温度を得るためのお湯と湯冷ましの量を計算
 *
 * @param totalVolume 総ミルク量（ml）
 * @param hotWaterTemp お湯の温度（°C）
 * @param coldWaterTemp 湯冷ましの温度（°C）
 * @param targetMixTemp 目標混合温度（°C）
 * @returns { hotWater, coldWater } お湯と湯冷ましの量（ml）
 */
export const calculateWaterVolumes = (
  totalVolume: number,
  hotWaterTemp: number,
  coldWaterTemp: number,
  targetMixTemp: number
): { hotWater: number; coldWater: number } => {
  // 熱量保存則より
  // hotWater * (hotWaterTemp - targetMixTemp) = coldWater * (targetMixTemp - coldWaterTemp)
  // hotWater + coldWater = totalVolume
  //
  // 解くと:
  // hotWater = totalVolume * (targetMixTemp - coldWaterTemp) / (hotWaterTemp - coldWaterTemp)

  const hotWater = (totalVolume * (targetMixTemp - coldWaterTemp)) / (hotWaterTemp - coldWaterTemp);
  const coldWater = totalVolume - hotWater;

  return {
    hotWater: Math.round(hotWater),
    coldWater: Math.round(coldWater),
  };
};

/**
 * 冷却速度の計算（°C/分）
 *
 * dT/dt = -k * (T - T_ambient)
 *
 * @param currentTemp 現在温度（°C）
 * @param ambient 周囲温度（°C）
 * @param k 冷却定数（1/分）
 * @returns 冷却速度（°C/分、負の値）
 */
export const calculateCoolingRate = (
  currentTemp: number,
  ambient: number,
  k: number
): number => {
  return -k * (currentTemp - ambient);
};
