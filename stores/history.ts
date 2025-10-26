import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MilkSession } from '~/types/session';

/**
 * 履歴ストア
 *
 * 過去の調乳セッションを管理
 * LocalStorageに永続化
 */
export const useHistoryStore = defineStore('history', () => {
  // 状態
  const sessions = ref<MilkSession[]>([]);

  // LocalStorageのキー
  const STORAGE_KEY = 'milcook_history';
  const MAX_HISTORY = 100; // 最大保存件数

  // 計算値
  const sessionCount = computed(() => sessions.value.length);
  const hasHistory = computed(() => sessions.value.length > 0);

  /**
   * 最近のセッション取得
   */
  const recentSessions = computed(() => {
    return sessions.value.slice(0, 10);
  });

  /**
   * 今日のセッション取得
   */
  const todaySessions = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessions.value.filter((session) => {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });
  });

  /**
   * 履歴をLocalStorageから読み込み
   */
  const loadHistory = (): void => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Date型に変換
        sessions.value = parsed.map((s: MilkSession) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : null,
        }));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      sessions.value = [];
    }
  };

  /**
   * 履歴をLocalStorageに保存
   */
  const saveHistory = (): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  /**
   * セッションを追加
   */
  const addSession = (session: MilkSession): void => {
    // 最新を先頭に追加
    sessions.value.unshift(session);

    // 最大件数を超えたら古いものを削除
    if (sessions.value.length > MAX_HISTORY) {
      sessions.value = sessions.value.slice(0, MAX_HISTORY);
    }

    saveHistory();
  };

  /**
   * セッションを削除
   */
  const removeSession = (id: string): void => {
    const index = sessions.value.findIndex((s) => s.id === id);
    if (index !== -1) {
      sessions.value.splice(index, 1);
      saveHistory();
    }
  };

  /**
   * 全履歴を削除
   */
  const clearHistory = (): void => {
    sessions.value = [];
    saveHistory();
  };

  /**
   * IDでセッションを取得
   */
  const getSessionById = (id: string): MilkSession | undefined => {
    return sessions.value.find((s) => s.id === id);
  };

  /**
   * 日付でセッションをフィルタ
   */
  const getSessionsByDate = (date: Date): MilkSession[] => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return sessions.value.filter((session) => {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === targetDate.getTime();
    });
  };

  /**
   * 統計情報を取得
   */
  const getStatistics = () => {
    if (sessions.value.length === 0) {
      return {
        totalSessions: 0,
        averageVolume: 0,
        averageActualTime: 0,
        mostUsedMethod: null,
        mostUsedMaterial: null,
      };
    }

    // 合計ミルク量
    const totalVolume = sessions.value.reduce((sum, s) => sum + s.volume, 0);
    const averageVolume = Math.round(totalVolume / sessions.value.length);

    // 平均冷却時間(実測値があるもののみ)
    const sessionsWithActualTime = sessions.value.filter((s) => s.actualTime !== null);
    const averageActualTime =
      sessionsWithActualTime.length > 0
        ? sessionsWithActualTime.reduce((sum, s) => sum + (s.actualTime || 0), 0) /
          sessionsWithActualTime.length
        : 0;

    // 最も使われている冷却方法
    const methodCounts = sessions.value.reduce(
      (counts, s) => {
        counts[s.coolingMethodId] = (counts[s.coolingMethodId] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );
    const mostUsedMethod =
      Object.keys(methodCounts).length > 0
        ? Object.keys(methodCounts).reduce((a, b) =>
            methodCounts[a] > methodCounts[b] ? a : b
          )
        : null;

    // 最も使われている材質
    const materialCounts = sessions.value.reduce(
      (counts, s) => {
        counts[s.materialId] = (counts[s.materialId] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );
    const mostUsedMaterial =
      Object.keys(materialCounts).length > 0
        ? Object.keys(materialCounts).reduce((a, b) =>
            materialCounts[a] > materialCounts[b] ? a : b
          )
        : null;

    return {
      totalSessions: sessions.value.length,
      averageVolume,
      averageActualTime,
      mostUsedMethod,
      mostUsedMaterial,
    };
  };

  // 初期化時に履歴を読み込み
  loadHistory();

  return {
    // 状態
    sessions,

    // 計算値
    sessionCount,
    hasHistory,
    recentSessions,
    todaySessions,

    // アクション
    loadHistory,
    saveHistory,
    addSession,
    removeSession,
    clearHistory,
    getSessionById,
    getSessionsByDate,
    getStatistics,
  };
});
