<script setup lang="ts">
import { computed } from 'vue';
import { useSessionStore } from '~/stores/session';
import { useDarkMode } from '~/composables/useDarkMode';

useHead({
  title: 'みるくっく - 科学的根拠に基づいた調乳タイマー',
  meta: [
    { name: 'description', content: 'ニュートンの冷却法則に基づいた正確な調乳タイマーアプリ' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
  ],
});

const sessionStore = useSessionStore();
const status = computed(() => sessionStore.status);

// ダークモード初期化
const { isDark } = useDarkMode();
</script>

<template>
  <div class="app">
    <!-- メインコンテンツ: 状態によってコンポーネントを切り替え -->
    <Transition name="fade" mode="out-in">
      <IdleScreen v-if="status === 'idle'" />
      <PreparingScreen v-else-if="status === 'preparing'" />
      <MixingScreen v-else-if="status === 'mixing'" />
      <CoolingScreen v-else-if="status === 'cooling'" />
      <CompletedScreen v-else-if="status === 'ready' || status === 'completed'" />
    </Transition>
  </div>
</template>

<style>
/* グローバルスタイル */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#__nuxt {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #fce4ec 100%);
  transition: background 0.3s ease, color 0.3s ease;
}

/* ダークモード */
html.dark body {
  background: linear-gradient(135deg, #1a237e 0%, #263238 50%, #311b92 100%);
  color: #e0e0e0;
}

.app {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* トランジションアニメーション */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ボタン共通スタイル */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s ease;
}

button:active {
  transform: scale(0.98);
}

/* スクロールバーのスタイル */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
