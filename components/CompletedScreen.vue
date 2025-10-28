<script setup lang="ts">
import { computed } from 'vue';
import { useSessionStore } from '~/stores/session';
import { useHistoryStore } from '~/stores/history';

const sessionStore = useSessionStore();
const historyStore = useHistoryStore();

const currentSession = computed(() => sessionStore.currentSession);

const actualTimeDisplay = computed(() => {
  if (!currentSession.value?.actualTime) {
    return '-';
  }

  const minutes = Math.floor(currentSession.value.actualTime);
  const seconds = Math.round((currentSession.value.actualTime - minutes) * 60);

  if (minutes > 0) {
    return `${minutes}分${seconds}秒`;
  }
  return `${seconds}秒`;
});

const handleAgain = () => {
  // 履歴に保存
  if (currentSession.value) {
    historyStore.addSession(currentSession.value);
  }

  // セッションをリセットして待機画面に戻る
  sessionStore.resetSession();
};

const handleHome = () => {
  // 履歴に保存
  if (currentSession.value) {
    historyStore.addSession(currentSession.value);
  }

  // セッションをリセット
  sessionStore.resetSession();
};
</script>

<template>
  <div class="completed-screen">
    <div class="container">
      <header class="header">
        <div class="success-icon">✅</div>
        <h1 class="title">適温になりました!</h1>
      </header>

      <main class="main">
        <!-- 温度表示 -->
        <div class="temp-display">
          <div class="final-temp">{{ currentSession?.targetTemp || 38 }}°C</div>
          <div class="temp-label">目標温度に到達</div>
        </div>

        <!-- 完了メッセージ -->
        <div class="success-box">
          <div class="success-emoji">🎉</div>
          <div class="success-text">完了</div>
        </div>

        <!-- 実際の時間 -->
        <div class="time-info">
          <div class="time-label">実際の冷却時間</div>
          <div class="time-value">{{ actualTimeDisplay }}</div>
        </div>
      </main>

      <footer class="footer">
        <button class="again-button" @click="handleAgain" aria-label="もう一度ミルクを作る">
          もう一度作る
        </button>
        <button class="home-button" @click="handleHome" aria-label="ホーム画面に戻る">
          ホームに戻る
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.completed-screen {
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
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.main {
  margin-bottom: 40px;
}

.temp-display {
  text-align: center;
  margin-bottom: 32px;
}

.final-temp {
  font-size: 56px;
  font-weight: bold;
  color: #4caf50;
  margin-bottom: 8px;
}

.temp-label {
  font-size: 14px;
  color: #555 /* コントラスト比改善 */;
}

.success-box {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 24px;
}

.success-emoji {
  font-size: 48px;
  margin-bottom: 8px;
}

.success-text {
  font-size: 20px;
  font-weight: bold;
  color: #2e7d32;
}

.time-info {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.time-label {
  font-size: 13px;
  color: #555 /* コントラスト比改善 */;
  margin-bottom: 8px;
}

.time-value {
  font-size: 32px;
  font-weight: bold;
  color: #f57c00;
}

.footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.again-button {
  width: 100%;
  background: linear-gradient(135deg, #2196f3, #00bcd4);
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.again-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
}

.home-button {
  width: 100%;
  background: white;
  border: 2px solid #e0e0e0;
  color: #555 /* コントラスト比改善 */;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
}

.home-button:hover {
  background: #f5f5f5;
}

@media (max-width: 480px) {
  .container {
    padding: 30px 20px;
  }

  .title {
    font-size: 24px;
  }

  .final-temp {
    font-size: 48px;
  }
}
</style>
