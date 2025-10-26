<script setup lang="ts">
import { useSessionStore } from '~/stores/session';

const sessionStore = useSessionStore();

const handleNext = () => {
  sessionStore.startMixing();
};

const handleCancel = () => {
  sessionStore.cancelSession();
};
</script>

<template>
  <div class="preparing-screen">
    <div class="container">
      <header class="header">
        <h1 class="title">準備チェック</h1>
        <p class="subtitle">必要なものを確認してください</p>
      </header>

      <main class="main">
        <div class="checklist">
          <div class="check-item">
            <div class="check-icon">✅</div>
            <div class="check-content">
              <div class="check-title">お湯 (85°C以上)</div>
              <div class="check-desc">ポットや沸かしたお湯を用意</div>
            </div>
          </div>

          <div class="check-item">
            <div class="check-icon">✅</div>
            <div class="check-content">
              <div class="check-title">湯冷まし (20°C前後)</div>
              <div class="check-desc">常温の水または白湯を冷ましたもの</div>
            </div>
          </div>

          <div class="check-item">
            <div class="check-icon">✅</div>
            <div class="check-content">
              <div class="check-title">哺乳瓶とミルク</div>
              <div class="check-desc">清潔な哺乳瓶と粉ミルク</div>
            </div>
          </div>

          <div class="check-item">
            <div class="check-icon">✅</div>
            <div class="check-content">
              <div class="check-title">氷水を準備</div>
              <div class="check-desc">ボウルに氷と水を入れて準備</div>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer">
        <button class="next-button" @click="handleNext">
          次へ
        </button>
        <button class="cancel-button" @click="handleCancel">
          キャンセル
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.preparing-screen {
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
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.header {
  text-align: center;
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
  flex: 1;
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.check-item {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.check-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.check-content {
  flex: 1;
}

.check-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.check-desc {
  font-size: 13px;
  color: #666;
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

.next-button:hover {
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

.cancel-button:hover {
  background: #f5f5f5;
}

@media (max-width: 480px) {
  .container {
    padding: 30px 20px;
  }

  .title {
    font-size: 24px;
  }
}
</style>
