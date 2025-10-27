<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSessionStore } from '~/stores/session';
import { useSettingsStore } from '~/stores/settings';
import { useThermalEngine } from '~/composables/useThermalEngine';

const sessionStore = useSessionStore();
const settingsStore = useSettingsStore();
const { calculateMixedTemp, calculateCoolingTime, calculateCoolingConstant, getMaterial, getCoolingMethod } = useThermalEngine();

// ユーザー入力値
const hotWaterTemp = ref(85);
const hotWaterVolume = ref(100);
const coldWaterTemp = ref(5);
const coldWaterVolume = ref(40);

// 粉ミルク溶かし完了チェック
const powderDissolved = ref(false);

// すべての入力が有効かチェック
const allInputsValid = computed(() => {
  return (
    hotWaterTemp.value > 0 &&
    hotWaterVolume.value > 0 &&
    coldWaterTemp.value >= 0 &&
    coldWaterVolume.value > 0 &&
    hotWaterTemp.value > coldWaterTemp.value &&
    powderDissolved.value
  );
});

// 混合後の温度を計算
const mixedTemp = computed(() => {
  return calculateMixedTemp(
    hotWaterTemp.value,
    hotWaterVolume.value,
    coldWaterTemp.value,
    coldWaterVolume.value
  );
});

// 総ミルク量
const totalVolume = computed(() => {
  return hotWaterVolume.value + coldWaterVolume.value;
});

// 予測冷却時間を計算
const predictedTime = computed(() => {
  if (!sessionStore.currentSession) return 0;

  const material = getMaterial(sessionStore.currentSession.materialId);
  const method = getCoolingMethod(sessionStore.currentSession.coolingMethodId);
  const targetTemp = sessionStore.currentSession.targetTemp;

  const time = calculateCoolingTime(
    mixedTemp.value,
    targetTemp,
    method.ambientTemp,
    totalVolume.value,
    material,
    method
  );

  // デバッグログ
  console.log('🔍 冷却時間計算:', {
    method: method.name,
    baseH: method.baseH,
    mixedTemp: mixedTemp.value.toFixed(1),
    targetTemp,
    ambientTemp: method.ambientTemp,
    totalVolume: totalVolume.value,
    material: material.name,
    thermalConductivity: material.thermalConductivity,
    predictedTime: time.toFixed(1) + '分'
  });

  return time;
});

const handleStartCooling = () => {
  if (allInputsValid.value && sessionStore.currentSession) {
    const material = getMaterial(sessionStore.currentSession.materialId);
    const method = getCoolingMethod(sessionStore.currentSession.coolingMethodId);

    // 冷却定数を計算
    const k = calculateCoolingConstant(
      totalVolume.value,
      material,
      method
    );

    // 実際のユーザー入力値で熱計算結果を更新
    sessionStore.updateThermalResult({
      initialMixTemp: mixedTemp.value,
      hotWaterVolume: hotWaterVolume.value,
      coldWaterVolume: coldWaterVolume.value,
      estimatedTime: predictedTime.value,
      ambientTemp: method.ambientTemp,
      coolingConstant: k,
      predictedCoolingTime: predictedTime.value,
      material,
      method,
    });
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
        <h1 class="title">実際の調乳内容を入力</h1>
        <p class="subtitle">入れたお湯と湯冷ましの量を教えてください</p>
      </header>

      <main class="main">
        <div class="inputs">
          <!-- お湯の入力 -->
          <div class="input-section">
            <h3 class="section-title">🌡️ お湯</h3>
            <div class="input-row">
              <div class="input-group">
                <label class="input-label">温度</label>
                <div class="input-with-unit">
                  <input
                    type="number"
                    v-model.number="hotWaterTemp"
                    min="40"
                    max="100"
                    step="1"
                    class="input-field"
                  />
                  <span class="unit">°C</span>
                </div>
              </div>
              <div class="input-group">
                <label class="input-label">量</label>
                <div class="input-with-unit">
                  <input
                    type="number"
                    v-model.number="hotWaterVolume"
                    min="0"
                    max="300"
                    step="10"
                    class="input-field"
                  />
                  <span class="unit">ml</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 湯冷ましの入力 -->
          <div class="input-section">
            <h3 class="section-title">💧 湯冷まし</h3>
            <div class="input-row">
              <div class="input-group">
                <label class="input-label">温度</label>
                <div class="input-with-unit">
                  <input
                    type="number"
                    v-model.number="coldWaterTemp"
                    min="0"
                    max="40"
                    step="1"
                    class="input-field"
                  />
                  <span class="unit">°C</span>
                </div>
              </div>
              <div class="input-group">
                <label class="input-label">量</label>
                <div class="input-with-unit">
                  <input
                    type="number"
                    v-model.number="coldWaterVolume"
                    min="0"
                    max="300"
                    step="10"
                    class="input-field"
                  />
                  <span class="unit">ml</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 粉ミルク確認 -->
          <div class="powder-check">
            <label class="checkbox-label">
              <input type="checkbox" v-model="powderDissolved" class="checkbox" />
              <span>粉ミルクを溶かしました</span>
            </label>
          </div>
        </div>

        <!-- 計算結果 -->
        <div class="result-box">
          <div class="result-row">
            <div class="result-item">
              <div class="result-label">総量</div>
              <div class="result-value">{{ totalVolume }}ml</div>
            </div>
            <div class="result-item">
              <div class="result-label">混合後の温度</div>
              <div class="result-value">{{ mixedTemp.toFixed(1) }}°C</div>
            </div>
          </div>
          <div class="result-row">
            <div class="result-item full">
              <div class="result-label">予測冷却時間</div>
              <div class="result-value large">{{ Math.round(predictedTime) }}分</div>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer">
        <button
          class="next-button"
          :class="{ disabled: !allInputsValid }"
          :disabled="!allInputsValid"
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
  font-size: 24px;
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

.inputs {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.input-section {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.input-with-unit {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.input-with-unit:focus-within {
  border-color: #2196f3;
}

.input-field {
  flex: 1;
  border: none;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  outline: none;
  width: 100%;
}

.input-field::-webkit-inner-spin-button,
.input-field::-webkit-outer-spin-button {
  opacity: 1;
}

.unit {
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #999;
  background: #f5f5f5;
  height: 100%;
  display: flex;
  align-items: center;
}

.powder-check {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.result-box {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border: 2px solid #ffcc80;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.result-row:last-child {
  grid-template-columns: 1fr;
}

.result-item {
  text-align: center;
}

.result-item.full {
  grid-column: 1 / -1;
}

.result-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.result-value {
  font-size: 24px;
  font-weight: bold;
  color: #f57c00;
}

.result-value.large {
  font-size: 32px;
  color: #e65100;
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
  transition: all 0.2s;
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
  transition: all 0.2s;
}

.cancel-button:hover {
  background: #f5f5f5;
}

@media (max-width: 480px) {
  .container {
    padding: 30px 20px;
  }

  .title {
    font-size: 20px;
  }

  .input-row {
    grid-template-columns: 1fr;
  }
}
</style>
