<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from '~/stores/settings';
import { useSessionStore } from '~/stores/session';
import { useHistoryStore } from '~/stores/history';
import { useThermalEngine } from '~/composables/useThermalEngine';
import { useDarkMode } from '~/composables/useDarkMode';

const settingsStore = useSettingsStore();
const sessionStore = useSessionStore();
const historyStore = useHistoryStore();
const { getMaterial, getCoolingMethod, materials, coolingMethods } = useThermalEngine();
const { colorMode, toggleColorMode } = useDarkMode();

const showSettings = ref(false);
const showHistory = ref(false);
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
  // セッションを開始（熱計算はMixingScreenでユーザー入力から行う）
  sessionStore.startSession(
    volume.value,
    settingsStore.settings.defaultMaterialId,
    settingsStore.settings.defaultCoolingMethodId,
    settingsStore.settings.defaultTargetTemp
    // resultは渡さない - MixingScreenでユーザー入力から計算
  );
};

const updateVolume = (event: Event) => {
  volume.value = parseInt((event.target as HTMLInputElement).value);
};

// 設定変更ハンドラ
const updateMaterial = (materialId: string) => {
  settingsStore.updateSettings({ defaultMaterialId: materialId });
};

const updateMethod = (methodId: string) => {
  settingsStore.updateSettings({ defaultCoolingMethodId: methodId });
};

const updateTargetTemp = (event: Event) => {
  const temp = parseInt((event.target as HTMLInputElement).value);
  settingsStore.updateSettings({ defaultTargetTemp: temp });
};
</script>

<template>
  <div class="idle-screen">
    <div class="container">
      <!-- ヘッダー -->
      <header class="header">
        <button
          class="history-icon-button"
          @click="showHistory = true"
          aria-label="履歴を表示"
        >
          📊
        </button>
        <div>
          <h1 class="title">🍼 みるくっく</h1>
          <p class="subtitle">科学的根拠に基づいた調乳タイマー</p>
        </div>
        <button
          class="theme-toggle-button"
          @click="toggleColorMode"
          :aria-label="`カラーモード: ${colorMode === 'light' ? 'ライト' : colorMode === 'dark' ? 'ダーク' : '自動'}`"
        >
          {{ colorMode === 'light' ? '☀️' : colorMode === 'dark' ? '🌙' : '🔄' }}
        </button>
      </header>

      <!-- メインコンテンツ -->
      <main class="main">
        <!-- ミルク量設定 -->
        <section class="volume-section">
          <label for="volume-slider" class="volume-display">{{ volume }}ml</label>
          <input
            id="volume-slider"
            type="range"
            min="60"
            max="240"
            step="20"
            :value="volume"
            @input="updateVolume"
            class="volume-slider"
            aria-label="ミルク量を選択"
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
        <button class="start-button" @click="handleStart" aria-label="ミルク作りを開始する">
          開始する
        </button>

        <!-- 詳細設定トグル -->
        <button
          class="settings-toggle"
          @click="showSettings = !showSettings"
          :aria-label="showSettings ? '詳細設定を閉じる' : '詳細設定を開く'"
          :aria-expanded="showSettings"
        >
          ⚙️ 詳細設定
          <span class="toggle-icon">{{ showSettings ? '▲' : '▼' }}</span>
        </button>

        <!-- 詳細設定パネル(折りたたみ) -->
        <Transition name="slide">
          <div v-if="showSettings" class="settings-panel">
            <!-- 哺乳瓶の材質 -->
            <div class="setting-group">
              <h4 class="setting-group-title">🍼 哺乳瓶の材質</h4>
              <div class="setting-options">
                <button
                  v-for="material in materials"
                  :key="material.id"
                  class="option-button"
                  :class="{ active: settingsStore.settings.defaultMaterialId === material.id }"
                  @click="updateMaterial(material.id)"
                  :aria-label="`哺乳瓶の材質を${material.name}に設定`"
                  :aria-pressed="settingsStore.settings.defaultMaterialId === material.id"
                >
                  <div class="option-name">{{ material.name }}</div>
                  <div class="option-desc">{{ material.description }}</div>
                </button>
              </div>
            </div>

            <!-- 冷却方法 -->
            <div class="setting-group">
              <h4 class="setting-group-title">❄️ 冷却方法</h4>
              <div class="setting-options">
                <button
                  v-for="method in coolingMethods"
                  :key="method.id"
                  class="option-button"
                  :class="{ active: settingsStore.settings.defaultCoolingMethodId === method.id }"
                  @click="updateMethod(method.id)"
                  :aria-label="`冷却方法を${method.name}に設定`"
                  :aria-pressed="settingsStore.settings.defaultCoolingMethodId === method.id"
                >
                  <div class="option-name">
                    {{ method.name }}
                    <span v-if="method.id === 'ice_stir'" class="recommend-badge">推奨</span>
                  </div>
                  <div class="option-desc">{{ method.description }}</div>
                </button>
              </div>
            </div>

            <!-- 目標温度 -->
            <div class="setting-group">
              <h4 class="setting-group-title">🌡️ 目標温度</h4>
              <div class="temp-setting">
                <input
                  type="range"
                  min="35"
                  max="42"
                  step="1"
                  :value="settingsStore.settings.defaultTargetTemp"
                  @input="updateTargetTemp"
                  class="temp-slider"
                  aria-label="目標温度を設定"
                  :aria-valuenow="settingsStore.settings.defaultTargetTemp"
                  aria-valuemin="35"
                  aria-valuemax="42"
                />
                <div class="temp-display">{{ settingsStore.settings.defaultTargetTemp }}°C</div>
                <div class="temp-labels">
                  <span>35°C</span>
                  <span>42°C</span>
                </div>
              </div>
            </div>
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

    <!-- 履歴モーダル -->
    <HistoryModal :show="showHistory" @close="showHistory = false" />
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
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

:global(html.dark) .container {
  background: #1e1e1e;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

/* ヘッダー */
.header {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.history-icon-button,
.theme-toggle-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.history-icon-button:hover,
.theme-toggle-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

:global(html.dark) .title {
  color: #e0e0e0;
}

.subtitle {
  font-size: 14px;
  color: #555 /* コントラスト比改善 */;
  transition: color 0.3s ease;
}

:global(html.dark) .subtitle {
  color: #aaa;
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
  color: #555 /* コントラスト比改善 */;
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
  color: #555 /* コントラスト比改善 */;
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
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-group-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.setting-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-button {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  text-align: left;
  transition: all 0.2s;
  cursor: pointer;
}

.option-button:hover {
  border-color: #2196f3;
  background: #f5f9ff;
}

.option-button.active {
  border-color: #2196f3;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
}

.option-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommend-badge {
  background: linear-gradient(135deg, #ff9800, #ff5722);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.option-desc {
  font-size: 12px;
  color: #555 /* コントラスト比改善 */;
}

.temp-setting {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.temp-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  margin-bottom: 12px;
}

.temp-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff5722;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 87, 34, 0.4);
}

.temp-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff5722;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(255, 87, 34, 0.4);
}

.temp-display {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #ff5722;
  margin-bottom: 8px;
}

.temp-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
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
  color: #555 /* コントラスト比改善 */;
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
  font-size: 12px;
  color: #555; /* コントラスト比改善: 白背景でWCAG AA準拠 */
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
