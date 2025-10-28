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
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
        </button>
        <div class="title-section">
          <div class="bottle-icon">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="milkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#FFB6C1;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#FF9AA2;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect x="20" y="16" width="24" height="40" rx="4" fill="none" stroke="url(#milkGradient)" stroke-width="3" stroke-linecap="round"/>
              <path d="M 26 16 L 26 10 Q 32 8 38 10 L 38 16" fill="none" stroke="url(#milkGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="22" y1="35" x2="42" y2="35" stroke="url(#milkGradient)" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
              <line x1="44" y1="25" x2="47" y2="25" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
              <line x1="44" y1="35" x2="47" y2="35" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
              <line x1="44" y1="45" x2="47" y2="45" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
            </svg>
          </div>
          <h1 class="title">みるくっく</h1>
        </div>
        <button
          class="theme-toggle-button"
          @click="toggleColorMode"
          :aria-label="`カラーモード: ${colorMode === 'light' ? 'ライト' : colorMode === 'dark' ? 'ダーク' : '自動'}`"
        >
          <svg v-if="colorMode === 'dark'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
          </svg>
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
          はじめる
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
                    <span v-if="method.id === 'ice_still'" class="recommend-badge">おすすめ</span>
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
@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap');

.idle-screen {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Zen Maru Gothic', 'M PLUS Rounded 1c', -apple-system, BlinkMacSystemFont, sans-serif;
}

.container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 32px;
  box-shadow: 0 12px 48px rgba(255, 182, 193, 0.3);
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
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.2);
}

.history-icon-button:hover,
.theme-toggle-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 182, 193, 0.3);
}

.history-icon-button svg,
.theme-toggle-button svg {
  width: 24px;
  height: 24px;
  fill: #FFB6C1;
}

.title-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bottle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottle-icon svg {
  width: 48px;
  height: 48px;
  animation: gentle-bounce 2s ease-in-out infinite;
}

@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: #FF8FA3;
  letter-spacing: 2px;
  transition: color 0.3s ease;
}

:global(html.dark) .title {
  color: #FFB6C1;
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
  font-size: 56px;
  font-weight: 700;
  color: #FFB6C1;
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(255, 182, 193, 0.2);
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
  background: #FFB6C1;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 182, 193, 0.4);
}

.volume-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #FFB6C1;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(255, 182, 193, 0.4);
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
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-size: 15px;
  color: #A0826D;
}

.setting-value {
  font-size: 15px;
  font-weight: 600;
  color: #D4A574;
}

/* 開始ボタン */
.start-button {
  width: 100%;
  background: linear-gradient(135deg, #FFB6C1 0%, #FF9AA2 100%);
  color: white;
  padding: 22px;
  border-radius: 20px;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 6px 20px rgba(255, 182, 193, 0.4);
  transition: all 0.3s;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 182, 193, 0.5);
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
  background: linear-gradient(135deg, #FFB6C1, #FF9AA2);
  color: white;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 8px;
  font-weight: 700;
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
