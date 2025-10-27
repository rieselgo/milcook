<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentTemp: number;
  targetTemp: number;
  volume: number; // ml
}

const props = defineProps<Props>();

// 温度に応じた色を計算
const liquidColor = computed(() => {
  const temp = props.currentTemp;

  if (temp >= 50) {
    return '#FF6B35'; // 濃いオレンジ
  } else if (temp >= 45) {
    return '#FF8C42'; // オレンジ
  } else if (temp >= 40) {
    return '#FFB84D'; // 薄いオレンジ
  } else if (temp >= props.targetTemp) {
    return '#FFF066'; // イエロー
  } else {
    return '#4CAF50'; // グリーン（適温到達）
  }
});

// 液面の高さを計算（ボトルの容量に応じて）
const liquidHeight = computed(() => {
  // 最大240ml想定で、液面の高さを20-80の範囲で調整
  const maxVolume = 240;
  const minHeight = 20;
  const maxHeight = 80;
  return minHeight + (props.volume / maxVolume) * (maxHeight - minHeight);
});

// 波のアニメーション用のパス（正弦波）
const waveAnimation = computed(() => {
  // 2つの波を重ねる（異なる位相とスピード）
  return {
    wave1: 'wave-animation-1 3s ease-in-out infinite',
    wave2: 'wave-animation-2 4s ease-in-out infinite',
  };
});
</script>

<template>
  <div class="bottle-animation">
    <svg
      viewBox="0 0 100 140"
      class="bottle-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- 液面の波のマスク -->
        <clipPath id="bottleClip">
          <path
            d="M 35 25 L 35 100 Q 35 120, 50 120 Q 65 120, 65 100 L 65 25 Q 65 20, 60 20 L 40 20 Q 35 20, 35 25 Z"
          />
        </clipPath>

        <!-- グラデーション定義 -->
        <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :style="{ stopColor: liquidColor, stopOpacity: 0.9 }" />
          <stop offset="100%" :style="{ stopColor: liquidColor, stopOpacity: 1 }" />
        </linearGradient>
      </defs>

      <!-- ボトル本体（アウトライン） -->
      <g class="bottle-outline">
        <!-- 乳首部分 -->
        <ellipse cx="50" cy="18" rx="8" ry="4" fill="#FFE5E5" stroke="#999" stroke-width="1" />
        <rect x="46" y="15" width="8" height="3" fill="#FFE5E5" />
        <path
          d="M 46 18 L 40 20 L 40 20 L 46 20 Z"
          fill="#FFE5E5"
          stroke="#999"
          stroke-width="1"
        />
        <path
          d="M 54 18 L 60 20 L 60 20 L 54 20 Z"
          fill="#FFE5E5"
          stroke="#999"
          stroke-width="1"
        />

        <!-- ボトル本体 -->
        <path
          d="M 35 25 L 35 100 Q 35 120, 50 120 Q 65 120, 65 100 L 65 25 Q 65 20, 60 20 L 40 20 Q 35 20, 35 25 Z"
          fill="rgba(255, 255, 255, 0.3)"
          stroke="#999"
          stroke-width="2"
        />

        <!-- 目盛り -->
        <line x1="30" y1="40" x2="35" y2="40" stroke="#CCC" stroke-width="1" />
        <line x1="30" y1="60" x2="35" y2="60" stroke="#CCC" stroke-width="1" />
        <line x1="30" y1="80" x2="35" y2="80" stroke="#CCC" stroke-width="1" />
        <line x1="30" y1="100" x2="35" y2="100" stroke="#CCC" stroke-width="1" />
      </g>

      <!-- 液体部分（波のアニメーション付き） -->
      <g clip-path="url(#bottleClip)">
        <!-- ベースの液体 -->
        <rect
          x="35"
          :y="120 - liquidHeight"
          width="30"
          :height="liquidHeight"
          fill="url(#liquidGradient)"
          opacity="0.9"
        />

        <!-- 波1 -->
        <path
          class="wave wave-1"
          :d="`M 35 ${120 - liquidHeight} Q 42.5 ${120 - liquidHeight - 2}, 50 ${120 - liquidHeight} T 65 ${120 - liquidHeight} L 65 120 L 35 120 Z`"
          :fill="liquidColor"
          opacity="0.5"
        />

        <!-- 波2 -->
        <path
          class="wave wave-2"
          :d="`M 35 ${120 - liquidHeight} Q 42.5 ${120 - liquidHeight + 1}, 50 ${120 - liquidHeight} T 65 ${120 - liquidHeight} L 65 120 L 35 120 Z`"
          :fill="liquidColor"
          opacity="0.3"
        />
      </g>

      <!-- 温度インジケーター -->
      <g class="temp-indicator">
        <rect
          x="70"
          y="30"
          width="8"
          height="80"
          fill="#F0F0F0"
          stroke="#CCC"
          stroke-width="1"
          rx="4"
        />
        <!-- 温度バー -->
        <rect
          x="71"
          :y="30 + 80 * (1 - Math.min(1, Math.max(0, (currentTemp - 30) / 30)))"
          width="6"
          :height="80 * Math.min(1, Math.max(0, (currentTemp - 30) / 30))"
          :fill="liquidColor"
          rx="3"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.bottle-animation {
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
}

.bottle-svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.bottle-outline {
  transition: all 0.3s ease;
}

/* 波のアニメーション */
.wave {
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.wave-1 {
  animation: wave-animation-1 3s infinite;
}

.wave-2 {
  animation: wave-animation-2 4s infinite;
}

@keyframes wave-animation-1 {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-2px);
  }
}

@keyframes wave-animation-2 {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(2px);
  }
}

/* 液体の色変化をスムーズに */
rect,
path {
  transition: fill 1s ease, stroke 1s ease;
}
</style>
