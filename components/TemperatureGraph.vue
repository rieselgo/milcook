<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  initialTemp: number;
  currentTemp: number;
  targetTemp: number;
  ambientTemp: number;
  coolingConstant: number;
  elapsedSeconds: number;
  predictedTime: number; // 分単位
}

const props = defineProps<Props>();

// グラフ設定
const width = 300;
const height = 180;
const padding = { top: 20, right: 20, bottom: 30, left: 40 };
const graphWidth = width - padding.left - padding.right;
const graphHeight = height - padding.top - padding.bottom;

// 表示時間範囲（予測時間の1.2倍か、最低3分）
const timeRange = computed(() => Math.max(3, props.predictedTime * 1.2));

// 温度範囲（目標温度から初期温度まで、余白込み）
const tempMin = computed(() => Math.floor(props.targetTemp - 5));
const tempMax = computed(() => Math.ceil(props.initialTemp + 5));
const tempRange = computed(() => tempMax.value - tempMin.value);

// 座標変換関数
const timeToX = (minutes: number): number => {
  return padding.left + (minutes / timeRange.value) * graphWidth;
};

const tempToY = (temp: number): number => {
  return padding.top + graphHeight - ((temp - tempMin.value) / tempRange.value) * graphHeight;
};

// 予測曲線のパスを生成
const predictedPath = computed(() => {
  const points: string[] = [];
  const steps = 50;

  for (let i = 0; i <= steps; i++) {
    const minutes = (i / steps) * timeRange.value;
    // ニュートンの冷却法則: T(t) = T_ambient + (T_initial - T_ambient) * e^(-k * t)
    const temp = props.ambientTemp + (props.initialTemp - props.ambientTemp) * Math.exp(-props.coolingConstant * minutes);
    const x = timeToX(minutes);
    const y = tempToY(temp);
    points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }

  return points.join(' ');
});

// 現在位置のマーカー
const currentX = computed(() => timeToX(props.elapsedSeconds / 60));
const currentY = computed(() => tempToY(props.currentTemp));

// 目標温度線
const targetY = computed(() => tempToY(props.targetTemp));

// Y軸のグリッド線とラベル
const yGridLines = computed(() => {
  const lines: Array<{ y: number; temp: number }> = [];
  const step = Math.ceil(tempRange.value / 4 / 5) * 5; // 5度刻みで4-5本

  for (let temp = Math.ceil(tempMin.value / step) * step; temp <= tempMax.value; temp += step) {
    lines.push({
      y: tempToY(temp),
      temp,
    });
  }

  return lines;
});

// X軸のグリッド線とラベル
const xGridLines = computed(() => {
  const lines: Array<{ x: number; minutes: number }> = [];
  const range = timeRange.value;
  const step = range <= 3 ? 1 : range <= 10 ? 2 : range <= 30 ? 5 : 10;

  for (let minutes = 0; minutes <= range; minutes += step) {
    lines.push({
      x: timeToX(minutes),
      minutes,
    });
  }

  return lines;
});
</script>

<template>
  <div class="temperature-graph">
    <svg :width="width" :height="height" class="graph-svg">
      <!-- グリッド線 -->
      <g class="grid">
        <!-- Y軸グリッド -->
        <line
          v-for="line in yGridLines"
          :key="`y-${line.temp}`"
          :x1="padding.left"
          :y1="line.y"
          :x2="width - padding.right"
          :y2="line.y"
          class="grid-line"
        />
        <!-- X軸グリッド -->
        <line
          v-for="line in xGridLines"
          :key="`x-${line.minutes}`"
          :x1="line.x"
          :y1="padding.top"
          :x2="line.x"
          :y2="height - padding.bottom"
          class="grid-line"
        />
      </g>

      <!-- 目標温度線 -->
      <line
        :x1="padding.left"
        :y1="targetY"
        :x2="width - padding.right"
        :y2="targetY"
        class="target-line"
      />

      <!-- 予測曲線 -->
      <path :d="predictedPath" class="predicted-curve" />

      <!-- 現在位置のマーカー -->
      <circle :cx="currentX" :cy="currentY" r="5" class="current-marker" />
      <circle :cx="currentX" :cy="currentY" r="3" class="current-marker-inner" />

      <!-- Y軸ラベル -->
      <g class="y-labels">
        <text
          v-for="line in yGridLines"
          :key="`y-label-${line.temp}`"
          :x="padding.left - 8"
          :y="line.y + 4"
          class="axis-label"
          text-anchor="end"
        >
          {{ line.temp }}°
        </text>
      </g>

      <!-- X軸ラベル -->
      <g class="x-labels">
        <text
          v-for="line in xGridLines"
          :key="`x-label-${line.minutes}`"
          :x="line.x"
          :y="height - padding.bottom + 18"
          class="axis-label"
          text-anchor="middle"
        >
          {{ line.minutes }}分
        </text>
      </g>

      <!-- 軸線 -->
      <line
        :x1="padding.left"
        :y1="padding.top"
        :x2="padding.left"
        :y2="height - padding.bottom"
        class="axis-line"
      />
      <line
        :x1="padding.left"
        :y1="height - padding.bottom"
        :x2="width - padding.right"
        :y2="height - padding.bottom"
        class="axis-line"
      />
    </svg>
  </div>
</template>

<style scoped>
.temperature-graph {
  width: 100%;
  display: flex;
  justify-content: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.graph-svg {
  display: block;
}

.grid-line {
  stroke: #e0e0e0;
  stroke-width: 1;
  opacity: 0.5;
}

.target-line {
  stroke: #4caf50;
  stroke-width: 2;
  stroke-dasharray: 4 4;
  opacity: 0.7;
}

.predicted-curve {
  fill: none;
  stroke: #2196f3;
  stroke-width: 2.5;
  opacity: 0.8;
}

.current-marker {
  fill: #ff6b35;
  stroke: white;
  stroke-width: 2;
}

.current-marker-inner {
  fill: white;
  pointer-events: none;
}

.axis-line {
  stroke: #333;
  stroke-width: 2;
}

.axis-label {
  font-size: 10px;
  fill: #666;
  font-family: system-ui, -apple-system, sans-serif;
}

@media (max-width: 480px) {
  .temperature-graph {
    padding: 12px;
  }

  .axis-label {
    font-size: 9px;
  }
}
</style>
