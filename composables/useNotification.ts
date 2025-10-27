import { ref } from 'vue';

export const useNotification = () => {
  const notificationPermission = ref<NotificationPermission>('default');
  const soundEnabled = ref(true);
  const vibrationEnabled = ref(true);

  // LocalStorageから設定を読み込む
  const loadSettings = () => {
    if (typeof window !== 'undefined') {
      const sound = localStorage.getItem('notification-sound');
      const vibration = localStorage.getItem('notification-vibration');
      soundEnabled.value = sound !== 'false';
      vibrationEnabled.value = vibration !== 'false';

      if ('Notification' in window) {
        notificationPermission.value = Notification.permission;
      }
    }
  };

  // 通知権限をリクエスト
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('このブラウザは通知をサポートしていません');
      return false;
    }

    if (Notification.permission === 'granted') {
      notificationPermission.value = 'granted';
      return true;
    }

    if (Notification.permission === 'denied') {
      notificationPermission.value = 'denied';
      return false;
    }

    const permission = await Notification.requestPermission();
    notificationPermission.value = permission;
    return permission === 'granted';
  };

  // バイブレーション（PRDの仕様: 200ms振動 - 100ms休止 - 200ms振動 - 100ms休止 - 200ms振動）
  const vibrate = () => {
    if (!vibrationEnabled.value) {
      return;
    }

    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  // 音声通知
  const playSound = () => {
    if (!soundEnabled.value) {
      return;
    }

    // Web Audio APIで簡単なビープ音を生成
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // 800Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('音声再生エラー:', error);
    }
  };

  // 適温到達通知（バイブレーション + 音声）
  const notifyTargetReached = () => {
    vibrate();
    playSound();

    // ブラウザ通知も送る（権限があれば）
    if (notificationPermission.value === 'granted') {
      new Notification('🍼 適温になりました！', {
        body: 'ミルクが飲み頃の温度になりました',
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: 'target-reached',
        renotify: true,
        vibrate: [200, 100, 200, 100, 200],
      });
    }
  };

  // 設定を保存
  const setSoundEnabled = (enabled: boolean) => {
    soundEnabled.value = enabled;
    localStorage.setItem('notification-sound', String(enabled));
  };

  const setVibrationEnabled = (enabled: boolean) => {
    vibrationEnabled.value = enabled;
    localStorage.setItem('notification-vibration', String(enabled));
  };

  // 初期化時に設定を読み込む
  if (typeof window !== 'undefined') {
    loadSettings();
  }

  return {
    notificationPermission,
    soundEnabled,
    vibrationEnabled,
    requestPermission,
    vibrate,
    playSound,
    notifyTargetReached,
    setSoundEnabled,
    setVibrationEnabled,
  };
};
