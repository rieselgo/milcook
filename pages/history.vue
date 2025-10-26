<script setup lang="ts">
import { computed } from 'vue';
import { useHistoryStore } from '~/stores/history';
import { useThermalEngine } from '~/composables/useThermalEngine';
import type { MilkSession } from '~/types/session';

useHead({
  title: '履歴 - みるくっく',
});

const historyStore = useHistoryStore();
const { getMaterial, getCoolingMethod } = useThermalEngine();

const sessions = computed(() => historyStore.sessions);
const stats = computed(() => historyStore.getStatistics());
const hasHistory = computed(() => historyStore.hasHistory);

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const formatDuration = (minutes: number | null) => {
  if (minutes === null) return '-';
  if (minutes < 1) return `${Math.round(minutes * 60)}秒`;
  return `${Math.round(minutes)}分`;
};

const getMaterialName = (id: string) => {
  return getMaterial(id).name;
};

const getMethodName = (id: string) => {
  return getCoolingMethod(id).name;
};

const handleClearHistory = () => {
  if (confirm('全ての履歴を削除しますか?')) {
    historyStore.clearHistory();
  }
};

const handleDeleteSession = (id: string) => {
  if (confirm('この記録を削除しますか?')) {
    historyStore.removeSession(id);
  }
};
</script>

<template>
  <div style="min-height: 100vh; background: #f5f5f5; padding-bottom: 40px;">
    <!-- ヘッダー -->
    <header style="background: linear-gradient(135deg, #2196F3, #00BCD4); color: white; padding: 20px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="max-width: 600px; margin: 0 auto; display: flex; align-items: center; gap: 16px;">
        <button
          @click="navigateTo('/')"
          style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"
        >
          ←
        </button>
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">履歴</h1>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <!-- 統計情報 -->
      <section v-if="hasHistory" style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 20px 0; color: #333;">📊 統計</h2>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <!-- 総回数 -->
          <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius: 12px;">
            <div style="font-size: 32px; font-weight: bold; color: #1976d2;">{{ stats.totalSessions }}</div>
            <div style="font-size: 12px; color: #555; margin-top: 4px;">総回数</div>
          </div>

          <!-- 平均ミルク量 -->
          <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, #f3e5f5, #e1bee7); border-radius: 12px;">
            <div style="font-size: 32px; font-weight: bold; color: #7b1fa2;">{{ stats.averageVolume }}</div>
            <div style="font-size: 12px; color: #555; margin-top: 4px;">平均ミルク量(ml)</div>
          </div>

          <!-- 平均冷却時間 -->
          <div v-if="stats.averageActualTime > 0" style="grid-column: 1 / -1; text-align: center; padding: 16px; background: linear-gradient(135deg, #fff3e0, #ffe0b2); border-radius: 12px;">
            <div style="font-size: 32px; font-weight: bold; color: #f57c00;">{{ Math.round(stats.averageActualTime) }}</div>
            <div style="font-size: 12px; color: #555; margin-top: 4px;">平均冷却時間(分)</div>
          </div>
        </div>

        <!-- よく使う設定 -->
        <div v-if="stats.mostUsedMaterial || stats.mostUsedMethod" style="margin-top: 16px; padding: 12px; background: #f9f9f9; border-radius: 8px;">
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">よく使う設定</div>
          <div style="font-size: 14px; color: #333;">
            <span v-if="stats.mostUsedMaterial">{{ getMaterialName(stats.mostUsedMaterial) }}</span>
            <span v-if="stats.mostUsedMaterial && stats.mostUsedMethod"> / </span>
            <span v-if="stats.mostUsedMethod">{{ getMethodName(stats.mostUsedMethod) }}</span>
          </div>
        </div>
      </section>

      <!-- 履歴がない場合 -->
      <div v-if="!hasHistory" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 64px; margin-bottom: 16px;">📊</div>
        <h2 style="font-size: 20px; color: #666; margin-bottom: 8px;">まだ履歴がありません</h2>
        <p style="font-size: 14px; color: #999; margin-bottom: 24px;">調乳を開始すると自動的に記録されます</p>
        <button
          @click="navigateTo('/')"
          style="background: linear-gradient(135deg, #2196F3, #00BCD4); color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer; font-size: 14px;"
        >
          ホームに戻る
        </button>
      </div>

      <!-- 履歴リスト -->
      <section v-if="hasHistory">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0; color: #333;">記録一覧</h2>
          <button
            @click="handleClearHistory"
            style="background: #f44336; color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer; font-size: 12px;"
          >
            全削除
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div
            v-for="session in sessions"
            :key="session.id"
            style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative;"
          >
            <!-- 削除ボタン -->
            <button
              @click="handleDeleteSession(session.id)"
              style="position: absolute; top: 12px; right: 12px; background: #f44336; color: white; border: none; border-radius: 6px; width: 24px; height: 24px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
            >
              ×
            </button>

            <!-- 日時 -->
            <div style="font-size: 12px; color: #999; margin-bottom: 8px;">
              {{ formatDate(session.startTime) }}
            </div>

            <!-- ミルク量 -->
            <div style="font-size: 24px; font-weight: bold; color: #2196F3; margin-bottom: 8px;">
              {{ session.volume }}ml
            </div>

            <!-- 詳細情報 -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: #666;">
              <div>
                <span style="color: #999;">材質:</span> {{ getMaterialName(session.materialId) }}
              </div>
              <div>
                <span style="color: #999;">冷却:</span> {{ getMethodName(session.coolingMethodId) }}
              </div>
              <div>
                <span style="color: #999;">初期:</span> {{ session.initialTemp.toFixed(1) }}°C
              </div>
              <div>
                <span style="color: #999;">目標:</span> {{ session.targetTemp }}°C
              </div>
            </div>

            <!-- 所要時間 -->
            <div v-if="session.actualTime !== null" style="margin-top: 12px; padding: 8px; background: #e8f5e9; border-radius: 6px; font-size: 12px; color: #2e7d32; text-align: center;">
              ⏱️ 実際の冷却時間: {{ formatDuration(session.actualTime) }}
              <span v-if="session.predictedTime" style="color: #666;">
                (予測: {{ formatDuration(session.predictedTime) }})
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
