import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface UserSettings {
  // デフォルト値
  defaultVolume: number; // ml
  defaultMaterialId: string;
  defaultCoolingMethodId: string;
  defaultTargetTemp: number; // °C
  defaultColdWaterTemp: number; // °C
  defaultTargetMixTemp: number; // °C

  // UI設定
  nightMode: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  // アラート設定
  alertBeforeMinutes: number; // 目標時刻の何分前にアラート
  alertEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  // デフォルト値
  defaultVolume: 140,
  defaultMaterialId: 'glass',
  defaultCoolingMethodId: 'ice_still',
  defaultTargetTemp: 38,
  defaultColdWaterTemp: 20,
  defaultTargetMixTemp: 70,

  // UI設定
  nightMode: false,
  soundEnabled: true,
  vibrationEnabled: true,

  // アラート設定
  alertBeforeMinutes: 1,
  alertEnabled: true,
};

/**
 * ユーザー設定ストア
 *
 * アプリの設定値を管理し、LocalStorageに永続化
 */
export const useSettingsStore = defineStore('settings', () => {
  // 状態
  const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS });

  // LocalStorageのキー
  const STORAGE_KEY = 'milcook_settings';

  /**
   * 設定をLocalStorageから読み込み
   */
  const loadSettings = (): void => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        settings.value = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      settings.value = { ...DEFAULT_SETTINGS };
    }
  };

  /**
   * 設定をLocalStorageに保存
   */
  const saveSettings = (): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  /**
   * 設定を更新
   */
  const updateSettings = (newSettings: Partial<UserSettings>): void => {
    settings.value = { ...settings.value, ...newSettings };
    saveSettings();
  };

  /**
   * 設定をリセット
   */
  const resetSettings = (): void => {
    settings.value = { ...DEFAULT_SETTINGS };
    saveSettings();
  };

  /**
   * 夜間モードを切り替え
   */
  const toggleNightMode = (): void => {
    settings.value.nightMode = !settings.value.nightMode;
    saveSettings();
  };

  /**
   * 音声を切り替え
   */
  const toggleSound = (): void => {
    settings.value.soundEnabled = !settings.value.soundEnabled;
    saveSettings();
  };

  /**
   * バイブレーションを切り替え
   */
  const toggleVibration = (): void => {
    settings.value.vibrationEnabled = !settings.value.vibrationEnabled;
    saveSettings();
  };

  /**
   * アラートを切り替え
   */
  const toggleAlert = (): void => {
    settings.value.alertEnabled = !settings.value.alertEnabled;
    saveSettings();
  };

  // 初期化時に設定を読み込み
  loadSettings();

  return {
    // 状態
    settings,

    // アクション
    loadSettings,
    saveSettings,
    updateSettings,
    resetSettings,
    toggleNightMode,
    toggleSound,
    toggleVibration,
    toggleAlert,
  };
});
