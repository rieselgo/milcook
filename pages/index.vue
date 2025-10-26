<script setup lang="ts">
// ホーム画面
useHead({
  title: '粉ミルク調乳タイマー',
});
</script>

<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #fce4ec 100%);">
    <div style="max-width: 500px; width: 100%; background: white; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🍼</div>
        <h1 style="font-size: 32px; font-weight: bold; color: #333; margin-bottom: 8px;">
          調乳タイマー
        </h1>
        <p style="color: #666;">科学的根拠に基づいた正確な調乳タイマー</p>
      </div>

      <div style="margin-bottom: 16px;">
        <button
          style="width: 100%; background: linear-gradient(135deg, #2196F3, #00BCD4); color: white; padding: 16px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer; font-size: 16px; box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);"
        >
          新しく調乳する
        </button>
      </div>

      <div style="background: linear-gradient(135deg, #f3e5f5, #fce4ec); border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 2px solid #e1bee7;">
        <h3 style="font-weight: bold; color: #333; margin-bottom: 8px;">クイックスタート</h3>
        <p style="font-size: 14px; color: #666; margin-bottom: 12px;">前回の設定で始める</p>
        <button
          style="width: 100%; background: white; color: #9c27b0; padding: 12px; border-radius: 12px; font-weight: bold; border: 2px solid #e1bee7; cursor: pointer; font-size: 14px;"
        >
          この設定で始める →
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <button
          style="background: linear-gradient(135deg, #fff3e0, #ffe0b2); border: 2px solid #ffcc80; padding: 16px; border-radius: 16px; cursor: pointer;"
        >
          <div style="font-size: 32px; margin-bottom: 8px;">⚙️</div>
          <p style="font-weight: bold; color: #333; font-size: 14px;">設定</p>
        </button>
        <button
          style="background: linear-gradient(135deg, #f3e5f5, #fce4ec); border: 2px solid #e1bee7; padding: 16px; border-radius: 16px; cursor: pointer;"
        >
          <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
          <p style="font-weight: bold; color: #333; font-size: 14px;">履歴</p>
        </button>
      </div>

      <div style="background: linear-gradient(135deg, #fff9c4, #ffecb3); border: 2px solid #fff176; border-radius: 16px; padding: 16px; display: flex; gap: 12px;">
        <div style="font-size: 24px;">💡</div>
        <div style="flex: 1; font-size: 14px;">
          <p style="font-weight: 600; color: #333; margin-bottom: 4px;">おすすめ冷却方法</p>
          <p style="color: #666;">氷水に浸けて軽く揺らすと約53秒で適温に！</p>
        </div>
      </div>
    </div>
  </div>
</template>
