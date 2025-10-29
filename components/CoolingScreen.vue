<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSessionStore } from '~/stores/session';
import { useThermalEngine } from '~/composables/useThermalEngine';
import { useNotification } from '~/composables/useNotification';

const sessionStore = useSessionStore();
const { calculateCurrentTemp, calculateRemainingTime, calculateCurrentCoolingRate } = useThermalEngine();
const { notifyTargetReached } = useNotification();

const thermalResult = computed(() => sessionStore.thermalResult);
const coolingStartTime = computed(() => sessionStore.coolingStartTime);
const elapsedSeconds = computed(() => sessionStore.elapsedSeconds);

let intervalId: number | null = null;
const isPaused = ref(false);

// 現在温度を計算
const currentTemp = computed(() => {
  if (!thermalResult.value || !coolingStartTime.value) {
    return thermalResult.value?.initialMixTemp || 0;
  }

  const elapsedMinutes = elapsedSeconds.value / 60;
  return calculateCurrentTemp(
    thermalResult.value.initialMixTemp,
    elapsedMinutes,
    thermalResult.value.ambientTemp,
    thermalResult.value.coolingConstant
  );
});

// 残り時間を計算
const remainingTime = computed(() => {
  if (!thermalResult.value || !sessionStore.currentSession) {
    return 0;
  }

  const remaining = calculateRemainingTime(
    currentTemp.value,
    sessionStore.currentSession.targetTemp,
    thermalResult.value.ambientTemp,
    thermalResult.value.coolingConstant
  );

  return Math.max(0, remaining);
});

// プログレス計算
const progress = computed(() => {
  if (!thermalResult.value || !sessionStore.currentSession) {
    return 0;
  }

  const initialTemp = thermalResult.value.initialMixTemp;
  const targetTemp = sessionStore.currentSession.targetTemp;
  const current = currentTemp.value;

  const totalDiff = initialTemp - targetTemp;
  const currentDiff = initialTemp - current;

  return Math.min(100, Math.max(0, (currentDiff / totalDiff) * 100));
});

// 冷却速度を計算
const coolingRate = computed(() => {
  if (!thermalResult.value) {
    return 0;
  }

  return calculateCurrentCoolingRate(
    currentTemp.value,
    thermalResult.value.ambientTemp,
    thermalResult.value.coolingConstant
  );
});

// 残り時間の表示
const remainingTimeDisplay = computed(() => {
  const minutes = Math.floor(remainingTime.value);
  const seconds = Math.round((remainingTime.value - minutes) * 60);

  if (minutes > 0) {
    return `${minutes}分${seconds}秒`;
  }
  return `${seconds}秒`;
});

// タイマー開始
onMounted(() => {
  intervalId = window.setInterval(() => {
    // 一時停止中はタイマー更新しない
    if (isPaused.value) {
      return;
    }

    sessionStore.updateElapsedTime(sessionStore.elapsedSeconds + 1);

    // 目標温度到達チェック
    if (sessionStore.currentSession && currentTemp.value <= sessionStore.currentSession.targetTemp) {
      // 通知を送る
      notifyTargetReached();
      sessionStore.reachTarget();
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
  }, 1000);
});

// タイマー停止
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const handlePauseResume = () => {
  if (isPaused.value) {
    // 再開
    isPaused.value = false;
  } else {
    // 一時停止
    isPaused.value = true;
  }
};

const handleStop = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  sessionStore.cancelSession();
};
</script>

<template>
  <div class="cooling-screen">
    <div class="container">
      <header class="header">
        <h1 class="title">冷却中</h1>
      </header>

      <main class="main">
        <!-- 現在温度（大きく表示） -->
        <div class="current-temp-section">
          <div class="current-temp-label">現在の温度</div>
          <div class="current-temp-large">{{ currentTemp.toFixed(1) }}°C</div>
          <div class="temp-arrow">↓</div>
          <div class="target-temp-small">目標 {{ sessionStore.currentSession?.targetTemp || 38 }}°C</div>
        </div>

        <!-- 残り時間（大きく表示） -->
        <div class="timer-section">
          <div class="timer-label">残り時間</div>
          <div class="timer-large">{{ remainingTimeDisplay }}</div>
        </div>

        <!-- プログレスバー -->
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-label">{{ Math.round(progress) }}%</div>

        <!-- 哺乳瓶アニメーション -->
        <div class="bottle-section">
          <BottleAnimation
            v-if="sessionStore.currentSession"
            :current-temp="currentTemp"
            :target-temp="sessionStore.currentSession.targetTemp"
            :volume="sessionStore.currentSession.totalVolume"
          />
        </div>

        <!-- 冷却速度（小さく表示） -->
        <div class="cooling-rate-small">
          冷却速度: {{ Math.abs(coolingRate).toFixed(1) }}°C/分
        </div>

        <!-- ヒント -->
        <div class="hint-box">
          <div class="hint-icon">🧊</div>
          <div class="hint-text">
            <div class="hint-title">{{ thermalResult?.method.name }}</div>
            <div class="hint-desc">哺乳瓶を軽く揺らしてください</div>
          </div>
        </div>
      </main>

      <footer class="footer">
        <div class="button-group">
          <button
            class="pause-button"
            @click="handlePauseResume"
            :aria-label="isPaused ? 'タイマーを再開' : 'タイマーを一時停止'"
          >
            {{ isPaused ? '▶️ 再開' : '⏸️ 一時停止' }}
          </button>
          <button
            class="stop-button"
            @click="handleStop"
            aria-label="タイマーを終了してホームに戻る"
          >
            ⏹️ 終了
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.cooling-screen {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  overflow: hidden;
}

.container {
  max-width: 500px;
  width: 100%;
  height: 100%;
  max-height: 100vh;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  text-align: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  margin-bottom: 12px;
}

/* 現在温度セクション（大きく） */
.current-temp-section {
  text-align: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.current-temp-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.current-temp-large {
  font-size: 64px;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 8px;
  line-height: 1;
}

.temp-arrow {
  font-size: 28px;
  color: #999;
  margin-bottom: 4px;
}

.target-temp-small {
  font-size: 18px;
  color: #4caf50;
  font-weight: 600;
}

/* タイマーセクション（大きく） */
.timer-section {
  text-align: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.timer-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.timer-large {
  font-size: 56px;
  font-weight: bold;
  color: #f57c00;
  line-height: 1;
}

.progress-container {
  width: 100%;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #2196f3, #00bcd4);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.progress-label {
  text-align: center;
  font-size: 11px;
  color: #777;
  margin-bottom: 16px;
  flex-shrink: 0;
}

/* 哺乳瓶セクション */
.bottle-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

/* 冷却速度（小さく） */
.cooling-rate-small {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.hint-box {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex-shrink: 0;
}

.hint-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.hint-text {
  flex: 1;
}

.hint-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.hint-desc {
  font-size: 12px;
  color: #555; /* コントラスト比改善: 白背景でWCAG AA準拠 */
}

.footer {
  flex-shrink: 0;
}

.button-group {
  display: flex;
  gap: 10px;
}

.pause-button,
.stop-button {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.pause-button {
  background: linear-gradient(135deg, #2196f3, #00bcd4);
  color: white;
}

.pause-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.stop-button {
  background: white;
  border: 2px solid #e0e0e0;
  color: #555 /* コントラスト比改善 */;
}

.stop-button:hover {
  background: #f5f5f5;
}

@media (max-width: 480px) {
  .container {
    padding: 16px 12px;
    border-radius: 20px;
  }

  .header {
    margin-bottom: 8px;
  }

  .title {
    font-size: 18px;
  }

  .current-temp-section {
    margin-bottom: 16px;
  }

  .current-temp-large {
    font-size: 52px;
  }

  .target-temp-small {
    font-size: 16px;
  }

  .timer-section {
    margin-bottom: 16px;
  }

  .timer-large {
    font-size: 44px;
  }

  .hint-box {
    padding: 10px;
  }

  .button-group {
    gap: 8px;
  }

  .pause-button,
  .stop-button {
    padding: 10px;
    font-size: 13px;
  }
}
</style>
