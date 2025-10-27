<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSessionStore } from '~/stores/session';
import { useThermalEngine } from '~/composables/useThermalEngine';

const sessionStore = useSessionStore();
const { calculateCurrentTemp, calculateRemainingTime, calculateCurrentCoolingRate } = useThermalEngine();

const thermalResult = computed(() => sessionStore.thermalResult);
const coolingStartTime = computed(() => sessionStore.coolingStartTime);
const elapsedSeconds = computed(() => sessionStore.elapsedSeconds);

let intervalId: number | null = null;

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
    sessionStore.updateElapsedTime(sessionStore.elapsedSeconds + 1);

    // 目標温度到達チェック
    if (sessionStore.currentSession && currentTemp.value <= sessionStore.currentSession.targetTemp) {
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

const handleCancel = () => {
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
        <!-- 哺乳瓶アニメーションと温度表示 -->
        <div class="visual-section">
          <BottleAnimation
            v-if="sessionStore.currentSession"
            :current-temp="currentTemp"
            :target-temp="sessionStore.currentSession.targetTemp"
            :volume="sessionStore.currentSession.totalVolume"
          />
          <div class="temp-display">
            <div class="current-temp">{{ currentTemp.toFixed(1) }}°C</div>
            <div class="temp-arrow">↓</div>
            <div class="target-temp">{{ sessionStore.currentSession?.targetTemp || 38 }}°C</div>
          </div>
        </div>

        <!-- 温度グラフ -->
        <TemperatureGraph
          v-if="thermalResult && sessionStore.currentSession"
          :initial-temp="thermalResult.initialMixTemp"
          :current-temp="currentTemp"
          :target-temp="sessionStore.currentSession.targetTemp"
          :ambient-temp="thermalResult.ambientTemp"
          :cooling-constant="thermalResult.coolingConstant"
          :elapsed-seconds="elapsedSeconds"
          :predicted-time="thermalResult.predictedTime"
        />

        <!-- プログレスバー -->
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-label">{{ Math.round(progress) }}%</div>

        <!-- 残り時間と冷却速度 -->
        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">残り時間</div>
            <div class="info-value">{{ remainingTimeDisplay }}</div>
          </div>
          <div class="info-box">
            <div class="info-label">冷却速度</div>
            <div class="info-value">{{ Math.abs(coolingRate).toFixed(1) }}<span class="unit">°C/分</span></div>
          </div>
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
        <button class="cancel-button" @click="handleCancel">
          キャンセル
        </button>
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

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.main {
  margin-bottom: 40px;
}

.visual-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.temp-display {
  text-align: center;
  flex: 1;
}

.current-temp {
  font-size: 56px;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 8px;
}

.temp-arrow {
  font-size: 32px;
  color: #999;
  margin-bottom: 8px;
}

.target-temp {
  font-size: 40px;
  font-weight: bold;
  color: #4caf50;
}

.progress-container {
  width: 100%;
  height: 16px;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  margin-top: 24px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #2196f3, #00bcd4);
  border-radius: 8px;
  transition: width 0.5s ease;
}

.progress-label {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 32px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.info-box {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.info-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.info-value {
  font-size: 28px;
  font-weight: bold;
  color: #f57c00;
}

.info-value .unit {
  font-size: 14px;
  font-weight: normal;
  margin-left: 2px;
}

.hint-box {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.hint-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.hint-text {
  flex: 1;
}

.hint-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.hint-desc {
  font-size: 13px;
  color: #666;
}

.footer {
}

.cancel-button {
  width: 100%;
  background: white;
  border: 2px solid #e0e0e0;
  color: #666;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
}

.cancel-button:hover {
  background: #f5f5f5;
}

@media (max-width: 480px) {
  .container {
    padding: 30px 20px;
  }

  .visual-section {
    flex-direction: column;
    gap: 16px;
  }

  .current-temp {
    font-size: 48px;
  }

  .target-temp {
    font-size: 36px;
  }
}
</style>
