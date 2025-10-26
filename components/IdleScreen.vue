<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from '~/stores/settings';
import { useSessionStore } from '~/stores/session';
import { useHistoryStore } from '~/stores/history';
import { useThermalEngine } from '~/composables/useThermalEngine';

const settingsStore = useSettingsStore();
const sessionStore = useSessionStore();
const historyStore = useHistoryStore();
const { getMaterial, getCoolingMethod, calculateMilkPreparation } = useThermalEngine();

const showSettings = ref(false);
const volume = ref(settingsStore.settings.defaultVolume);

const materialName = computed(() => {
  return getMaterial(settingsStore.settings.defaultMaterialId).name;
});

const methodName = computed(() => {
  return getCoolingMethod(settingsStore.settings.defaultCoolingMethodId).name;
});

const todaySessions = computed(() => historyStore.todaySessions);
const todayCount = computed(() => todaySessions.value.length);
const todayVolume = computed(() => {
  return todaySessions.value.reduce((sum, s) => sum + s.volume, 0);
});

const handleStart = () => {
  // 熱計算を実行
  const result = calculateMilkPreparation({
    volume: volume.value,
    materialId: settingsStore.settings.defaultMaterialId,
    coolingMethodId: settingsStore.settings.defaultCoolingMethodId,
    targetTemp: settingsStore.settings.defaultTargetTemp,
    coldWaterTemp: settingsStore.settings.defaultColdWaterTemp,
    targetMixTemp: settingsStore.settings.defaultTargetMixTemp,
  });

  // セッションを開始
  sessionStore.startSession(
    volume.value,
    settingsStore.settings.defaultMaterialId,
    settingsStore.settings.defaultCoolingMethodId,
    settingsStore.settings.defaultTargetTemp,
    result
  );
};

const updateVolume = (event: Event) => {
  volume.value = parseInt((event.target as HTMLInputElement).value);
};
</script>

<template>
  <div class="idle-screen">
    <div class="container">
      <!-- ヘッダー -->
      <header class="header">
        <h1 class="title">🍼 みるくっく</h1>
        <p class="subtitle">科学的根拠に基づいた調乳タイマー</p>
      </header>

      <!-- メインコンテンツ -->
      <main class="main">
        <!-- ミルク量設定 -->
        <section class="volume-section">
          <div class="volume-display">{{ volume }}ml</div>
          <input
            type="range"
            min="60"
            max="240"
            step="20"
            :value="volume"
            @input="updateVolume"
            class="volume-slider"
          />
          <div class="volume-labels">
            <span>60ml</span>
            <span>240ml</span>
          </div>
        </section>

        <!-- 現在の設定 -->
        <section class="current-settings">
          <div class="setting-item">
            <span class="setting-label">哺乳瓶:</span>
            <span class="setting-value">{{ materialName }}</span>
          </div>
          <div class="setting-item">
            <span class="setting-label">冷却方法:</span>
            <span class="setting-value">{{ methodName }}</span>
          </div>
        </section>

        <!-- 開始ボタン -->
        <button class="start-button" @click="handleStart">
          開始する
        </button>

        <!-- 詳細設定トグル -->
        <button class="settings-toggle" @click="showSettings = !showSettings">
          ⚙️ 詳細設定
          <span class="toggle-icon">{{ showSettings ? '▲' : '▼' }}</span>
        </button>

        <!-- 詳細設定パネル(折りたたみ) -->
        <Transition name="slide">
          <div v-if="showSettings" class="settings-panel">
            <p class="settings-info">詳細な設定変更機能は後のフェーズで実装予定</p>
          </div>
        </Transition>

        <!-- 今日の記録 -->
        <section v-if="todayCount > 0" class="today-summary">
          <h3 class="summary-title">📊 今日の記録</h3>
          <div class="summary-stats">
            <div class="stat-item">
              <div class="stat-value">{{ todayCount }}</div>
              <div class="stat-label">回</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ todayVolume }}</div>
              <div class="stat-label">ml</div>
            </div>
          </div>
        </section>
      </main>

      <!-- フッター(ヒント) -->
      <footer class="footer">
        <div class="hint">
          <div class="hint-icon">💡</div>
          <div class="hint-text">
            <div class="hint-title">おすすめ冷却方法</div>
            <div class="hint-desc">氷水に浸けて軽く揺らすと早く冷めます</div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.idle-screen {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ヘッダー */
.header {
  text-align: center;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #666;
}

/* メイン */
.main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ミルク量設定 */
.volume-section {
  text-align: center;
}

.volume-display {
  font-size: 48px;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 16px;
}

.volume-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2196f3;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
}

.volume-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2196f3;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
}

.volume-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 現在の設定 */
.current-settings {
  background: linear-gradient(135deg, #f3e5f5, #fce4ec);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-size: 14px;
  color: #666;
}

.setting-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 開始ボタン */
.start-button {
  width: 100%;
  background: linear-gradient(135deg, #2196f3, #00bcd4);
  color: white;
  padding: 18px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
}

/* 詳細設定トグル */
.settings-toggle {
  width: 100%;
  background: white;
  border: 2px solid #e0e0e0;
  color: #666;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.toggle-icon {
  font-size: 12px;
}

/* 詳細設定パネル */
.settings-panel {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.settings-info {
  font-size: 12px;
  color: #999;
  text-align: center;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 今日の記録 */
.today-summary {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-radius: 12px;
  padding: 16px;
}

.summary-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.summary-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #2e7d32;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* フッター */
.footer {
}

.hint {
  background: linear-gradient(135deg, #fff9c4, #ffecb3);
  border: 2px solid #fff176;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.hint-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.hint-text {
  flex: 1;
}

.hint-title {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.hint-desc {
  font-size: 11px;
  color: #666;
}

/* レスポンシブ */
@media (max-width: 480px) {
  .container {
    padding: 30px 20px;
  }

  .title {
    font-size: 28px;
  }

  .volume-display {
    font-size: 40px;
  }
}
</style>
