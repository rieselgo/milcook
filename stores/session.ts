import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MilkSession } from '~/types/session';
import type { ThermalCalculationResult } from '~/composables/useThermalEngine';

export type SessionStatus = 'idle' | 'preparing' | 'mixing' | 'cooling' | 'ready' | 'completed';

/**
 * セッションストア
 *
 * 現在進行中の調乳セッションを管理
 */
export const useSessionStore = defineStore('session', () => {
  // 状態
  const currentSession = ref<MilkSession | null>(null);
  const status = ref<SessionStatus>('idle');
  const thermalResult = ref<ThermalCalculationResult | null>(null);

  // 冷却開始時刻
  const coolingStartTime = ref<Date | null>(null);
  const elapsedSeconds = ref(0);

  // 計算値
  const isActive = computed(() => currentSession.value !== null);
  const isIdle = computed(() => status.value === 'idle');
  const isPreparing = computed(() => status.value === 'preparing');
  const isMixing = computed(() => status.value === 'mixing');
  const isCooling = computed(() => status.value === 'cooling');
  const isReady = computed(() => status.value === 'ready');
  const isCompleted = computed(() => status.value === 'completed');

  /**
   * 新しいセッションを開始
   */
  const startSession = (
    volume: number,
    materialId: string,
    coolingMethodId: string,
    targetTemp: number,
    result: ThermalCalculationResult
  ): void => {
    currentSession.value = {
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: null,
      volume,
      materialId,
      coolingMethodId,
      targetTemp,
      initialTemp: result.initialMixTemp,
      finalTemp: null,
      predictedTime: result.predictedCoolingTime,
      actualTime: null,
      hotWaterVolume: result.hotWaterVolume,
      coldWaterVolume: result.coldWaterVolume,
    };

    thermalResult.value = result;
    status.value = 'preparing';
    coolingStartTime.value = null;
    elapsedSeconds.value = 0;
  };

  /**
   * 混合ステップに進む
   */
  const startMixing = (): void => {
    if (!currentSession.value) return;
    status.value = 'mixing';
  };

  /**
   * 冷却ステップに進む
   */
  const startCooling = (): void => {
    if (!currentSession.value) return;
    status.value = 'cooling';
    coolingStartTime.value = new Date();
    elapsedSeconds.value = 0;
  };

  /**
   * 経過時間を更新(タイマーから呼び出される)
   */
  const updateElapsedTime = (seconds: number): void => {
    elapsedSeconds.value = seconds;
  };

  /**
   * 目標温度到達
   */
  const reachTarget = (): void => {
    if (!currentSession.value) return;
    status.value = 'ready';
  };

  /**
   * セッションを完了
   */
  const completeSession = (finalTemp?: number): void => {
    if (!currentSession.value) return;

    currentSession.value.endTime = new Date();
    currentSession.value.finalTemp = finalTemp || null;

    if (coolingStartTime.value) {
      const actualMinutes =
        (new Date().getTime() - coolingStartTime.value.getTime()) / 1000 / 60;
      currentSession.value.actualTime = actualMinutes;
    }

    status.value = 'completed';
  };

  /**
   * セッションをキャンセル
   */
  const cancelSession = (): void => {
    currentSession.value = null;
    thermalResult.value = null;
    status.value = 'idle';
    coolingStartTime.value = null;
    elapsedSeconds.value = 0;
  };

  /**
   * セッションをリセット(完了後に次のセッションへ)
   */
  const resetSession = (): void => {
    currentSession.value = null;
    thermalResult.value = null;
    status.value = 'idle';
    coolingStartTime.value = null;
    elapsedSeconds.value = 0;
  };

  return {
    // 状態
    currentSession,
    status,
    thermalResult,
    coolingStartTime,
    elapsedSeconds,

    // 計算値
    isActive,
    isIdle,
    isPreparing,
    isMixing,
    isCooling,
    isReady,
    isCompleted,

    // アクション
    startSession,
    startMixing,
    startCooling,
    updateElapsedTime,
    reachTarget,
    completeSession,
    cancelSession,
    resetSession,
  };
});
