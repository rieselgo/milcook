<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '~/stores/settings';
import { useSessionStore } from '~/stores/session';
import { useHistoryStore } from '~/stores/history';
import { useThermalEngine } from '~/composables/useThermalEngine';

useHead({
  title: 'みるくっく - 科学的根拠に基づいた調乳タイマー',
});

// ストア
const settingsStore = useSettingsStore();
const sessionStore = useSessionStore();
const historyStore = useHistoryStore();
const { getMaterial, getCoolingMethod, calculateMilkPreparation } = useThermalEngine();

// 計算値
const settings = computed(() => settingsStore.settings);
const historyCount = computed(() => historyStore.sessionCount);
const todaySessions = computed(() => historyStore.todaySessions);

const materialName = computed(() => {
  const material = getMaterial(settings.value.defaultMaterialId);
  return material.name;
});

const methodName = computed(() => {
  const method = getCoolingMethod(settings.value.defaultCoolingMethodId);
  return method.name;
});

const todayTotalVolume = computed(() => {
  return todaySessions.value.reduce((sum, s) => sum + s.volume, 0);
});

// メソッド
const handleQuickStart = () => {
  // デフォルト設定で調乳を開始
  const result = calculateMilkPreparation({
    volume: settings.value.defaultVolume,
    materialId: settings.value.defaultMaterialId,
    coolingMethodId: settings.value.defaultCoolingMethodId,
    targetTemp: settings.value.defaultTargetTemp,
    coldWaterTemp: settings.value.defaultColdWaterTemp,
    targetMixTemp: settings.value.defaultTargetMixTemp,
  });

  // セッションを開始
  sessionStore.startSession(
    settings.value.defaultVolume,
    settings.value.defaultMaterialId,
    settings.value.defaultCoolingMethodId,
    settings.value.defaultTargetTemp,
    result
  );

  // 準備ページへ遷移
  navigateTo('/prepare');
};
</script>

<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #fce4ec 100%);">
    <div style="max-width: 500px; width: 100%; background: white; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🍼</div>
        <h1 style="font-size: 32px; font-weight: bold; color: #333; margin-bottom: 8px;">
          みるくっく
        </h1>
        <p style="color: #666;">科学的根拠に基づいた調乳タイマー</p>
      </div>

      <!-- クイックスタート -->
      <div style="background: linear-gradient(135deg, #f3e5f5, #fce4ec); border-radius: 16px; padding: 20px; margin-bottom: 16px; border: 2px solid #e1bee7;">
        <h3 style="font-weight: bold; color: #333; margin-bottom: 8px;">⚡ クイックスタート</h3>
        <p style="font-size: 14px; color: #666; margin-bottom: 12px;">
          {{ settings.defaultVolume }}ml / {{ materialName }} / {{ methodName }}
        </p>
        <button
          @click="handleQuickStart"
          style="width: 100%; background: white; color: #9c27b0; padding: 12px; border-radius: 12px; font-weight: bold; border: 2px solid #e1bee7; cursor: pointer; font-size: 14px; transition: all 0.2s;"
          @mouseover="$event.target.style.background = '#f3e5f5'"
          @mouseout="$event.target.style.background = 'white'"
        >
          この設定で始める →
        </button>
      </div>

      <!-- カスタム設定 -->
      <div style="margin-bottom: 16px;">
        <button
          @click="navigateTo('/prepare')"
          style="width: 100%; background: linear-gradient(135deg, #2196F3, #00BCD4); color: white; padding: 16px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer; font-size: 16px; box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3); transition: all 0.2s;"
          @mouseover="$event.target.style.transform = 'translateY(-2px)'"
          @mouseout="$event.target.style.transform = 'translateY(0)'"
        >
          カスタム設定で始める
        </button>
      </div>

      <!-- その他の機能 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <button
          @click="navigateTo('/settings')"
          style="background: linear-gradient(135deg, #fff3e0, #ffe0b2); border: 2px solid #ffcc80; padding: 16px; border-radius: 16px; cursor: pointer; transition: all 0.2s;"
          @mouseover="$event.target.style.transform = 'scale(1.05)'"
          @mouseout="$event.target.style.transform = 'scale(1)'"
        >
          <div style="font-size: 32px; margin-bottom: 8px;">⚙️</div>
          <p style="font-weight: bold; color: #333; font-size: 14px; margin: 0;">設定</p>
        </button>
        <button
          @click="navigateTo('/history')"
          style="background: linear-gradient(135deg, #f3e5f5, #fce4ec); border: 2px solid #e1bee7; padding: 16px; border-radius: 16px; cursor: pointer; transition: all 0.2s; position: relative;"
          @mouseover="$event.target.style.transform = 'scale(1.05)'"
          @mouseout="$event.target.style.transform = 'scale(1)'"
        >
          <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
          <p style="font-weight: bold; color: #333; font-size: 14px; margin: 0;">
            履歴
            <span v-if="historyCount > 0" style="display: inline-block; background: #9c27b0; color: white; border-radius: 10px; padding: 2px 6px; font-size: 11px; margin-left: 4px;">{{ historyCount }}</span>
          </p>
        </button>
      </div>

      <!-- 今日の記録 -->
      <div v-if="todaySessions.length > 0" style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border: 2px solid #81c784; border-radius: 16px; padding: 16px; margin-bottom: 16px;">
        <h3 style="font-weight: bold; color: #333; margin-bottom: 12px; font-size: 14px;">今日の記録</h3>
        <div style="display: flex; gap: 16px;">
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #2e7d32;">{{ todaySessions.length }}</div>
            <div style="font-size: 12px; color: #666;">回</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #2e7d32;">{{ todayTotalVolume }}</div>
            <div style="font-size: 12px; color: #666;">ml</div>
          </div>
        </div>
      </div>

      <!-- ヒント -->
      <div style="background: linear-gradient(135deg, #fff9c4, #ffecb3); border: 2px solid #fff176; border-radius: 16px; padding: 16px; display: flex; gap: 12px;">
        <div style="font-size: 24px;">💡</div>
        <div style="flex: 1; font-size: 14px;">
          <p style="font-weight: 600; color: #333; margin: 0 0 4px 0;">おすすめ冷却方法</p>
          <p style="color: #666; margin: 0;">氷水に浸けて軽く揺らすと早く冷めます！</p>
        </div>
      </div>
    </div>
  </div>
</template>
