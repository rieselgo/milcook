<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showPrompt = ref(false);
const deferredPrompt = ref<any>(null);

onMounted(() => {
  // インストール済みかチェック
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return; // すでにインストール済み
  }

  // 以前に閉じられたかチェック
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed) {
    return;
  }

  // beforeinstallpromptイベントをリッスン
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    showPrompt.value = true;
  });
});

const handleInstall = async () => {
  if (!deferredPrompt.value) {
    return;
  }

  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;

  if (outcome === 'accepted') {
    console.log('PWAインストールが承認されました');
  } else {
    console.log('PWAインストールが拒否されました');
  }

  deferredPrompt.value = null;
  showPrompt.value = false;
};

const handleDismiss = () => {
  showPrompt.value = false;
  localStorage.setItem('pwa-install-dismissed', 'true');
};
</script>

<template>
  <Transition name="slide-up">
    <div v-if="showPrompt" class="pwa-install-prompt">
      <div class="prompt-content">
        <div class="prompt-icon">📱</div>
        <div class="prompt-text">
          <div class="prompt-title">アプリをホーム画面に追加</div>
          <div class="prompt-desc">オフラインでも使えて、すぐに起動できます</div>
        </div>
        <div class="prompt-actions">
          <button class="install-button" @click="handleInstall">
            追加
          </button>
          <button class="dismiss-button" @click="handleDismiss">
            後で
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px;
  background: linear-gradient(135deg, #FF6B35, #FF8C42);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
}

.prompt-content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.prompt-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.prompt-text {
  flex: 1;
  color: white;
}

.prompt-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.prompt-desc {
  font-size: 13px;
  opacity: 0.9;
}

.prompt-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.install-button,
.dismiss-button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.install-button {
  background: white;
  color: #FF6B35;
}

.install-button:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.dismiss-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.dismiss-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* アニメーション */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (max-width: 480px) {
  .prompt-content {
    flex-wrap: wrap;
  }

  .prompt-actions {
    width: 100%;
    justify-content: stretch;
  }

  .install-button,
  .dismiss-button {
    flex: 1;
  }
}
</style>
