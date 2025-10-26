import { computed, ref, type Ref } from 'vue';
import type { BottleMaterial, CoolingMethod } from '~/types/thermal';
import {
  calculateNewtonCooling,
  calculateCoolingConstant,
  calculateTimeToTarget,
  calculateMixedTemperature,
  calculateWaterVolumes,
  calculateCoolingRate,
} from '~/utils/thermal/calculator';
import { getMaterial, getAllMaterials } from '~/utils/thermal/materials';
import { getCoolingMethod, getAllCoolingMethods } from '~/utils/thermal/methods';
import { HOT_WATER_TEMP } from '~/utils/thermal/constants';

export interface ThermalCalculationParams {
  volume: number; // ml
  materialId: string;
  coolingMethodId: string;
  targetTemp: number; // °C
  coldWaterTemp: number; // °C
  targetMixTemp?: number; // °C (デフォルトは70°C)
}

export interface ThermalCalculationResult {
  // 水の量
  hotWaterVolume: number; // ml
  coldWaterVolume: number; // ml
  initialMixTemp: number; // °C

  // 冷却予測
  coolingConstant: number; // 1/分
  predictedCoolingTime: number; // 分
  ambientTemp: number; // °C

  // 使用された設定
  material: BottleMaterial;
  method: CoolingMethod;
}

/**
 * 熱力学計算エンジンのコンポーザブル
 *
 * ミルク調乳に必要な全ての熱計算を提供
 */
export const useThermalEngine = () => {
  // 利用可能な材質と冷却方法
  const materials = getAllMaterials();
  const coolingMethods = getAllCoolingMethods();

  /**
   * ミルク調乳の熱計算を実行
   *
   * 1. お湯と湯冷ましの量を計算
   * 2. 混合後の温度を計算
   * 3. 冷却時間を予測
   */
  const calculateMilkPreparation = (
    params: ThermalCalculationParams
  ): ThermalCalculationResult => {
    const {
      volume,
      materialId,
      coolingMethodId,
      targetTemp,
      coldWaterTemp,
      targetMixTemp = 70, // デフォルトは70°C
    } = params;

    // 材質と冷却方法を取得
    const material = getMaterial(materialId);
    const method = getCoolingMethod(coolingMethodId);

    // お湯と湯冷ましの量を計算
    const { hotWater, coldWater } = calculateWaterVolumes(
      volume,
      HOT_WATER_TEMP,
      coldWaterTemp,
      targetMixTemp
    );

    // 混合後の初期温度を計算
    const initialMixTemp = calculateMixedTemperature(
      HOT_WATER_TEMP,
      hotWater,
      coldWaterTemp,
      coldWater
    );

    // 冷却定数を計算
    const k = calculateCoolingConstant(volume, material, method);

    // 目標温度までの冷却時間を予測
    const predictedCoolingTime = calculateTimeToTarget(
      initialMixTemp,
      targetTemp,
      method.ambientTemp,
      k
    );

    return {
      hotWaterVolume: hotWater,
      coldWaterVolume: coldWater,
      initialMixTemp,
      coolingConstant: k,
      predictedCoolingTime,
      ambientTemp: method.ambientTemp,
      material,
      method,
    };
  };

  /**
   * リアルタイム温度計算
   *
   * 冷却開始からの経過時間から現在温度を予測
   */
  const calculateCurrentTemp = (
    initialTemp: number,
    elapsedTime: number, // 分
    ambientTemp: number,
    coolingConstant: number
  ): number => {
    return calculateNewtonCooling(initialTemp, elapsedTime, ambientTemp, coolingConstant);
  };

  /**
   * 現在の冷却速度を計算
   */
  const calculateCurrentCoolingRate = (
    currentTemp: number,
    ambientTemp: number,
    coolingConstant: number
  ): number => {
    return calculateCoolingRate(currentTemp, ambientTemp, coolingConstant);
  };

  /**
   * 残り時間を計算
   */
  const calculateRemainingTime = (
    currentTemp: number,
    targetTemp: number,
    ambientTemp: number,
    coolingConstant: number
  ): number => {
    return calculateTimeToTarget(currentTemp, targetTemp, ambientTemp, coolingConstant);
  };

  /**
   * 冷却方法の比較
   *
   * 同じ条件で異なる冷却方法の所要時間を比較
   */
  const compareCoolingMethods = (
    volume: number,
    material: BottleMaterial,
    initialTemp: number,
    targetTemp: number
  ) => {
    return coolingMethods.map((method) => {
      const k = calculateCoolingConstant(volume, material, method);
      const time = calculateTimeToTarget(initialTemp, targetTemp, method.ambientTemp, k);

      return {
        method,
        coolingTime: time,
        coolingTimeSeconds: Math.round(time * 60),
      };
    });
  };

  return {
    // データ
    materials,
    coolingMethods,

    // 計算関数
    calculateMilkPreparation,
    calculateCurrentTemp,
    calculateCurrentCoolingRate,
    calculateRemainingTime,
    compareCoolingMethods,

    // ユーティリティ
    getMaterial,
    getCoolingMethod,
  };
};

/**
 * リアクティブな温度トラッキング用コンポーザブル
 *
 * タイマー実行中の温度変化を追跡
 */
export const useThermalTracking = (
  initialTemp: Ref<number>,
  targetTemp: Ref<number>,
  ambientTemp: Ref<number>,
  coolingConstant: Ref<number>
) => {
  const startTime = ref<Date | null>(null);
  const elapsedMinutes = ref(0);

  // 現在温度（計算値）
  const currentTemp = computed(() => {
    if (!startTime.value || elapsedMinutes.value === 0) {
      return initialTemp.value;
    }

    return calculateNewtonCooling(
      initialTemp.value,
      elapsedMinutes.value,
      ambientTemp.value,
      coolingConstant.value
    );
  });

  // 残り時間（分）
  const remainingTime = computed(() => {
    return calculateTimeToTarget(
      currentTemp.value,
      targetTemp.value,
      ambientTemp.value,
      coolingConstant.value
    );
  });

  // 目標温度到達判定
  const isTargetReached = computed(() => {
    return currentTemp.value <= targetTemp.value;
  });

  // 冷却速度（°C/分）
  const coolingRate = computed(() => {
    return calculateCoolingRate(currentTemp.value, ambientTemp.value, coolingConstant.value);
  });

  // トラッキング開始
  const startTracking = () => {
    startTime.value = new Date();
    elapsedMinutes.value = 0;
  };

  // 経過時間を更新（タイマーから呼び出される）
  const updateElapsedTime = (minutes: number) => {
    elapsedMinutes.value = minutes;
  };

  // リセット
  const reset = () => {
    startTime.value = null;
    elapsedMinutes.value = 0;
  };

  return {
    // 状態
    startTime,
    elapsedMinutes,
    currentTemp,
    remainingTime,
    isTargetReached,
    coolingRate,

    // メソッド
    startTracking,
    updateElapsedTime,
    reset,
  };
};
