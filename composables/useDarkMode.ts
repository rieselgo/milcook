import { ref, watch, onMounted } from 'vue';

export type ColorMode = 'light' | 'dark' | 'auto';

export const useDarkMode = () => {
  const colorMode = ref<ColorMode>('auto');
  const isDark = ref(false);

  // LocalStorageからモードを読み込む
  const loadColorMode = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('milcook-color-mode') as ColorMode;
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        colorMode.value = saved;
      }
    }
  };

  // システムのダークモード設定を検出
  const getSystemDarkMode = (): boolean => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  // ダークモードの状態を更新
  const updateDarkMode = () => {
    if (colorMode.value === 'auto') {
      isDark.value = getSystemDarkMode();
    } else {
      isDark.value = colorMode.value === 'dark';
    }

    // HTMLに反映
    if (typeof document !== 'undefined') {
      if (isDark.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // カラーモードを設定
  const setColorMode = (mode: ColorMode) => {
    colorMode.value = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('milcook-color-mode', mode);
    }
    updateDarkMode();
  };

  // モード切り替え（light → dark → auto → light）
  const toggleColorMode = () => {
    const modes: ColorMode[] = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(colorMode.value);
    const nextIndex = (currentIndex + 1) % modes.length;
    setColorMode(modes[nextIndex]);
  };

  // システム設定の変更を監視
  const watchSystemDarkMode = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        if (colorMode.value === 'auto') {
          updateDarkMode();
        }
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  };

  // 初期化
  onMounted(() => {
    loadColorMode();
    updateDarkMode();
    watchSystemDarkMode();
  });

  // colorModeが変更されたら更新
  watch(colorMode, updateDarkMode);

  return {
    colorMode,
    isDark,
    setColorMode,
    toggleColorMode,
  };
};
