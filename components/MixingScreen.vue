<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSessionStore } from '~/stores/session';

const sessionStore = useSessionStore();

const steps = ref({
  hotWater: false,
  coldWater: false,
  powder: false,
});

const allChecked = computed(() => {
  return steps.value.hotWater && steps.value.coldWater && steps.value.powder;
});

const thermalResult = computed(() => sessionStore.thermalResult);

const handleStartCooling = () => {
  if (allChecked.value) {
    sessionStore.startCooling();
  }
};

const handleCancel = () => {
  sessionStore.cancelSession();
};
</script>

<template>
  <div class="mixing-screen">
    <div class="container">
      <header class="header">
        <h1 class="title">調乳ガイド</h1>
        <p class="subtitle">順番に進めてください</p>
      </header>

      <main class="main">
        <div class="steps">
          <!-- ステップ1: お湯 -->
          <div class="step" :class="{ completed: steps.hotWater }">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3 class="step-title">お湯を入れる</h3>
              <div class="step-amount">🌡️ {{ thermalResult?.hotWaterVolume || 0 }}ml</div>
              <p class="step-desc">85°Cのお湯</p>
              <label class="step-checkbox">
                <input type="checkbox" v-model="steps.hotWater" />
                <span>入れました</span>
              </label>
            </div>
          </div>

          <!-- ステップ2: 湯冷まし -->
          <div class="step" :class="{ completed: steps.coldWater }">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3 class="step-title">湯冷ましを入れる</h3>
              <div class="step-amount">💧 {{ thermalResult?.coldWaterVolume || 0 }}ml</div>
              <p class="step-desc">20°Cの湯冷まし</p>
              <label class="step-checkbox">
                <input type="checkbox" v-model="steps.coldWater" />
                <span>入れました</span>
              </label>
            </div>
          </div>

          <!-- ステップ3: ミルク -->
          <div class="step" :class="{ completed: steps.powder }">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3 class="step-title">ミルクを溶かす</h3>
              <p class="step-desc">粉ミルクを入れて溶かす</p>
              <label class="step-checkbox">
                <input type="checkbox" v-model="steps.powder" />
                <span>溶かしました</span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="thermalResult" class="info-box">
          <div class="info-label">混合後の温度</div>
          <div class="info-value">{{ thermalResult.initialMixTemp.toFixed(1) }}°C</div>
        </div>
      </main>

      <footer class="footer">
        <button
          class="next-button"
          :class="{ disabled: !allChecked }"
          :disabled="!allChecked"
          @click="handleStartCooling"
        >
          冷却を開始する
        </button>
        <button class="cancel-button" @click="handleCancel">
          キャンセル
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.mixing-screen {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
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
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #666;
}

.main {
  margin-bottom: 32px;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.step {
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  transition: all 0.3s;
}

.step.completed {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-color: #81c784;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2196f3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
}

.step.completed .step-number {
  background: #4caf50;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.step-amount {
  font-size: 24px;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 4px;
}

.step-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.step-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.step-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.info-box {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border: 2px solid #ffcc80;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.info-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.info-value {
  font-size: 28px;
  font-weight: bold;
  color: #f57c00;
}

.footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.next-button {
  width: 100%;
  background: linear-gradient(135deg, #2196f3, #00bcd4);
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.next-button.disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.next-button:not(.disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
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

@media (max-width: 480px) {
  .container {
    padding: 30px 20px;
  }
}
</style>
