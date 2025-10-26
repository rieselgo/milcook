<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '~/stores/settings';
import { useThermalEngine } from '~/composables/useThermalEngine';

useHead({
  title: '設定 - みるくっく',
});

const settingsStore = useSettingsStore();
const { materials, coolingMethods } = useThermalEngine();

const settings = computed(() => settingsStore.settings);

const updateVolume = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
  settingsStore.updateSettings({ defaultVolume: value });
};

const updateMaterial = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  settingsStore.updateSettings({ defaultMaterialId: value });
};

const updateCoolingMethod = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  settingsStore.updateSettings({ defaultCoolingMethodId: value });
};

const updateTargetTemp = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
  settingsStore.updateSettings({ defaultTargetTemp: value });
};

const updateColdWaterTemp = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
  settingsStore.updateSettings({ defaultColdWaterTemp: value });
};

const updateTargetMixTemp = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
  settingsStore.updateSettings({ defaultTargetMixTemp: value });
};

const updateAlertBefore = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
  settingsStore.updateSettings({ alertBeforeMinutes: value });
};
</script>

<template>
  <div style="min-height: 100vh; background: #f5f5f5; padding-bottom: 40px;">
    <!-- ヘッダー -->
    <header style="background: linear-gradient(135deg, #2196F3, #00BCD4); color: white; padding: 20px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="max-width: 600px; margin: 0 auto; display: flex; align-items: center; gap: 16px;">
        <button
          @click="navigateTo('/')"
          style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"
        >
          ←
        </button>
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">設定</h1>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <!-- デフォルト値設定 -->
      <section style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 20px 0; color: #333;">デフォルト値</h2>

        <!-- ミルク量 -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">
            ミルク量: {{ settings.defaultVolume }}ml
          </label>
          <input
            type="range"
            min="60"
            max="240"
            step="20"
            :value="settings.defaultVolume"
            @input="updateVolume"
            style="width: 100%; height: 8px; border-radius: 4px; background: #ddd; outline: none; -webkit-appearance: none;"
          />
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #999; margin-top: 4px;">
            <span>60ml</span>
            <span>240ml</span>
          </div>
        </div>

        <!-- 哺乳瓶の材質 -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">
            哺乳瓶の材質
          </label>
          <select
            :value="settings.defaultMaterialId"
            @change="updateMaterial"
            style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; background: white; cursor: pointer;"
          >
            <option v-for="material in materials" :key="material.id" :value="material.id">
              {{ material.name }}
            </option>
          </select>
        </div>

        <!-- 冷却方法 -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">
            冷却方法
          </label>
          <select
            :value="settings.defaultCoolingMethodId"
            @change="updateCoolingMethod"
            style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; background: white; cursor: pointer;"
          >
            <option v-for="method in coolingMethods" :key="method.id" :value="method.id">
              {{ method.name }} - {{ method.description }}
            </option>
          </select>
        </div>

        <!-- 目標温度 -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">
            目標温度: {{ settings.defaultTargetTemp }}°C
          </label>
          <input
            type="range"
            min="35"
            max="42"
            step="1"
            :value="settings.defaultTargetTemp"
            @input="updateTargetTemp"
            style="width: 100%; height: 8px; border-radius: 4px; background: #ddd; outline: none; -webkit-appearance: none;"
          />
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #999; margin-top: 4px;">
            <span>35°C</span>
            <span>42°C</span>
          </div>
        </div>

        <!-- 湯冷ましの温度 -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">
            湯冷ましの温度: {{ settings.defaultColdWaterTemp }}°C
          </label>
          <input
            type="range"
            min="10"
            max="30"
            step="1"
            :value="settings.defaultColdWaterTemp"
            @input="updateColdWaterTemp"
            style="width: 100%; height: 8px; border-radius: 4px; background: #ddd; outline: none; -webkit-appearance: none;"
          />
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #999; margin-top: 4px;">
            <span>10°C</span>
            <span>30°C</span>
          </div>
        </div>

        <!-- 混合温度 -->
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">
            混合後の温度: {{ settings.defaultTargetMixTemp }}°C
          </label>
          <input
            type="range"
            min="50"
            max="80"
            step="5"
            :value="settings.defaultTargetMixTemp"
            @input="updateTargetMixTemp"
            style="width: 100%; height: 8px; border-radius: 4px; background: #ddd; outline: none; -webkit-appearance: none;"
          />
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #999; margin-top: 4px;">
            <span>50°C</span>
            <span>80°C</span>
          </div>
        </div>
      </section>

      <!-- UI設定 -->
      <section style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 20px 0; color: #333;">UI設定</h2>

        <!-- 夜間モード -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 12px; background: #f9f9f9; border-radius: 8px;">
          <div>
            <div style="font-weight: 600; color: #333; margin-bottom: 4px;">🌙 夜間モード</div>
            <div style="font-size: 12px; color: #666;">暗い画面で目に優しく</div>
          </div>
          <button
            @click="settingsStore.toggleNightMode()"
            :style="{
              width: '60px',
              height: '32px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              background: settings.nightMode ? '#4CAF50' : '#ccc',
              position: 'relative',
              transition: 'all 0.3s'
            }"
          >
            <div :style="{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '4px',
              left: settings.nightMode ? '32px' : '4px',
              transition: 'all 0.3s'
            }"></div>
          </button>
        </div>

        <!-- 音声 -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 12px; background: #f9f9f9; border-radius: 8px;">
          <div>
            <div style="font-weight: 600; color: #333; margin-bottom: 4px;">🔊 音声</div>
            <div style="font-size: 12px; color: #666;">通知音を鳴らす</div>
          </div>
          <button
            @click="settingsStore.toggleSound()"
            :style="{
              width: '60px',
              height: '32px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              background: settings.soundEnabled ? '#4CAF50' : '#ccc',
              position: 'relative',
              transition: 'all 0.3s'
            }"
          >
            <div :style="{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '4px',
              left: settings.soundEnabled ? '32px' : '4px',
              transition: 'all 0.3s'
            }"></div>
          </button>
        </div>

        <!-- バイブレーション -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9f9f9; border-radius: 8px;">
          <div>
            <div style="font-weight: 600; color: #333; margin-bottom: 4px;">📳 バイブレーション</div>
            <div style="font-size: 12px; color: #666;">端末を振動させる</div>
          </div>
          <button
            @click="settingsStore.toggleVibration()"
            :style="{
              width: '60px',
              height: '32px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              background: settings.vibrationEnabled ? '#4CAF50' : '#ccc',
              position: 'relative',
              transition: 'all 0.3s'
            }"
          >
            <div :style="{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '4px',
              left: settings.vibrationEnabled ? '32px' : '4px',
              transition: 'all 0.3s'
            }"></div>
          </button>
        </div>
      </section>

      <!-- アラート設定 -->
      <section style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 20px 0; color: #333;">アラート設定</h2>

        <!-- アラート有効化 -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 12px; background: #f9f9f9; border-radius: 8px;">
          <div>
            <div style="font-weight: 600; color: #333; margin-bottom: 4px;">⏰ アラート</div>
            <div style="font-size: 12px; color: #666;">目標時刻前に通知</div>
          </div>
          <button
            @click="settingsStore.toggleAlert()"
            :style="{
              width: '60px',
              height: '32px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              background: settings.alertEnabled ? '#4CAF50' : '#ccc',
              position: 'relative',
              transition: 'all 0.3s'
            }"
          >
            <div :style="{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '4px',
              left: settings.alertEnabled ? '32px' : '4px',
              transition: 'all 0.3s'
            }"></div>
          </button>
        </div>

        <!-- アラートタイミング -->
        <div v-if="settings.alertEnabled">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">
            アラートタイミング: {{ settings.alertBeforeMinutes }}分前
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            :value="settings.alertBeforeMinutes"
            @input="updateAlertBefore"
            style="width: 100%; height: 8px; border-radius: 4px; background: #ddd; outline: none; -webkit-appearance: none;"
          />
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #999; margin-top: 4px;">
            <span>0分前</span>
            <span>5分前</span>
          </div>
        </div>
      </section>

      <!-- リセットボタン -->
      <button
        @click="settingsStore.resetSettings()"
        style="width: 100%; background: #f44336; color: white; padding: 16px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer; font-size: 16px; box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);"
      >
        設定を初期化
      </button>
    </main>
  </div>
</template>
