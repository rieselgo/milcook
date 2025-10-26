# コーディング規約 - 粉ミルク調乳タイマー

## TypeScript規約

### 型定義のベストプラクティス

#### ✅ Good: 明確な型定義
```typescript
interface BottleMaterial {
  id: 'glass' | 'plastic' | 'ppsu';
  name: string;
  thermalConductivity: number; // W/(m·K)
  thickness: number; // m
  density: number; // kg/m³
  specificHeat: number; // J/(kg·K)
}

const getMaterial = (id: string): BottleMaterial | undefined => {
  return materials.find(m => m.id === id);
};
```

#### ❌ Bad: any型の使用
```typescript
const getMaterial = (id: any): any => {
  return materials.find((m: any) => m.id === id);
};
```

### any型の使用禁止

- `any` 型は**原則使用禁止**
- やむを得ない場合は `unknown` を使用し、型ガードで安全に処理
- サードパーティライブラリの型がない場合のみ例外

```typescript
// ✅ Good: unknown + 型ガード
const parseData = (data: unknown): User | null => {
  if (isUser(data)) {
    return data;
  }
  return null;
};

function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}

// ❌ Bad: any型
const parseData = (data: any): any => {
  return data;
};
```

### インターフェースとタイプの使い分け

- **Interface**: オブジェクトの形状を定義、拡張可能
- **Type**: ユニオン型、交差型、プリミティブのエイリアス

```typescript
// ✅ Interface: 拡張可能なオブジェクト
interface TimerState {
  isRunning: boolean;
  elapsedTime: number;
}

interface AdvancedTimerState extends TimerState {
  pauseCount: number;
}

// ✅ Type: ユニオン型
type CoolingMethodId = 'ice_stir' | 'ice_still' | 'running_water' | 'ice_water_running' | 'air';

// ✅ Type: 交差型
type TimerWithSettings = TimerState & SessionSettings;
```

### 関数の型注釈

- 引数と戻り値には必ず型を指定
- アロー関数でも同様

```typescript
// ✅ Good: 型注釈あり
const calculateTemperature = (
  initialTemp: number,
  elapsedTime: number,
  material: BottleMaterial,
  method: CoolingMethod
): number => {
  // ...
};

// ✅ Good: Promise型
const fetchHistory = async (userId: string): Promise<MilkSession[]> => {
  // ...
};

// ❌ Bad: 型注釈なし
const calculateTemperature = (initialTemp, elapsedTime, material, method) => {
  // ...
};
```

---

## Nuxt.js / Vue 3規約

### Composition API の使用

- **Options API は使用禁止**
- 全てのコンポーネントで Composition API を使用
- `<script setup>` を推奨

```vue
<!-- ✅ Good: Composition API + script setup -->
<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  initialTemp: number;
  targetTemp: number;
}

const props = defineProps<Props>();
const currentTemp = ref(props.initialTemp);

const progress = computed(() => {
  return ((props.initialTemp - currentTemp.value) / (props.initialTemp - props.targetTemp)) * 100;
});
</script>

<!-- ❌ Bad: Options API -->
<script lang="ts">
export default {
  data() {
    return {
      currentTemp: 46.6
    };
  }
};
</script>
```

### コンポーネント設計原則

#### 単一責任の原則
- 1コンポーネント = 1つの明確な責務
- 大きすぎる場合は分割

```
✅ Good:
- BottleVisual.vue（哺乳瓶の描画のみ）
- TemperatureDisplay.vue（温度表示のみ）
- TimerControls.vue（タイマー操作のみ）

❌ Bad:
- TimerPage.vue（全ての機能を1つに詰め込む）
```

#### Props vs Emits
- **Props**: 親から子へデータを渡す（読み取り専用）
- **Emits**: 子から親へイベントを通知

```vue
<!-- ✅ Good: Props + Emits -->
<script setup lang="ts">
interface Props {
  temperature: number;
  isRunning: boolean;
}

interface Emits {
  (e: 'pause'): void;
  (e: 'resume'): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handlePause = () => {
  emit('pause');
};
</script>
```

### ディレクトリ構造のルール

```
components/
├── bottle/          # 機能ごとにグループ化
│   ├── BottleVisual.vue
│   └── TemperatureGradient.vue
├── timer/
│   ├── TimerDisplay.vue
│   ├── ProgressBar.vue
│   └── ShakeReminder.vue
└── ui/              # 共通UIコンポーネント
    ├── Button.vue
    ├── Card.vue
    └── Modal.vue
```

### 命名規則

#### ファイル名
- **コンポーネント**: PascalCase（例: `BottleVisual.vue`）
- **Composables**: camelCase、`use` プレフィックス（例: `useThermalEngine.ts`）
- **ユーティリティ**: camelCase（例: `colorInterpolation.ts`）
- **型定義**: camelCase（例: `thermal.ts`）

#### 変数・関数名
```typescript
// ✅ Good: camelCase
const currentTemperature = 38;
const calculateCoolingTime = () => {};

// ✅ Good: boolean は is/has プレフィックス
const isRunning = true;
const hasShaken = false;

// ✅ Good: 定数は UPPER_SNAKE_CASE
const MAX_TEMPERATURE = 100;
const DEFAULT_VOLUME = 140;

// ❌ Bad: PascalCase（型以外）
const CurrentTemperature = 38;

// ❌ Bad: snake_case
const current_temperature = 38;
```

---

## コードスタイル

### インデント・フォーマット
- **インデント**: 2スペース
- **セミコロン**: 使用する
- **クォート**: シングルクォート（'）優先
- **行の最大長**: 100文字（推奨）

```typescript
// ✅ Good
const message = 'Hello, World!';
const user = {
  id: 1,
  name: 'Alice',
};

// ❌ Bad: ダブルクォート、セミコロンなし
const message = "Hello, World!"
const user = {
  id: 1,
  name: "Alice"
}
```

### オブジェクト・配列
```typescript
// ✅ Good: 末尾カンマ
const settings = {
  volume: 140,
  material: 'glass',
  targetTemp: 38,
};

const materials = [
  'glass',
  'plastic',
  'ppsu',
];

// ❌ Bad: 末尾カンマなし
const settings = {
  volume: 140,
  material: 'glass',
  targetTemp: 38
};
```

---

## コメント規約

### JSDocの使用

複雑な関数・計算ロジックにはJSDocを記述

```typescript
/**
 * ニュートンの冷却法則を用いて経過時間後の温度を計算
 *
 * @param initialTemp - 初期温度（°C）
 * @param elapsedTime - 経過時間（分）
 * @param ambient - 周囲温度（°C）
 * @param k - 冷却定数（1/分）
 * @returns 計算された温度（°C）
 *
 * @example
 * const temp = calculateNewtonCooling(46.6, 0.88, 2, 0.2401);
 * // => 38.0
 */
const calculateNewtonCooling = (
  initialTemp: number,
  elapsedTime: number,
  ambient: number,
  k: number
): number => {
  return ambient + (initialTemp - ambient) * Math.exp(-k * elapsedTime);
};
```

### 複雑なロジックへのコメント

```typescript
// ✅ Good: 複雑な計算に説明コメント
const calculateHeatTransferCoefficient = (velocity: number, baseH: number): number => {
  // 対流熱伝達係数は流速の平方根に比例
  // h = h_base * sqrt(velocity / velocity_ref)
  const velocityRef = 0.1; // 基準流速 (m/s)
  return baseH * Math.sqrt(velocity / velocityRef);
};

// ✅ Good: ビジネスロジックの意図を説明
// 氷水攪拌は15秒ごとに揺らすことで対流を促進し、冷却を加速
if (method.id === 'ice_stir' && timer % 15 === 0) {
  triggerShakeReminder();
}
```

### TODOの書き方

```typescript
// TODO(担当者): 説明
// TODO(serizawa): 実測データを元に冷却定数を再キャリブレーション

// FIXME: 緊急度の高いバグ
// FIXME: タイマー停止時にメモリリークの可能性

// NOTE: 補足情報
// NOTE: iOS Safariでは Vibration API が未対応
```

---

## パフォーマンス考慮事項

### 不要な再レンダリングの防止

```vue
<!-- ✅ Good: computed で計算結果をキャッシュ -->
<script setup lang="ts">
const progress = computed(() => {
  return ((initialTemp - currentTemp.value) / (initialTemp - targetTemp)) * 100;
});
</script>

<!-- ❌ Bad: テンプレート内で毎回計算 -->
<template>
  <div>{{ ((initialTemp - currentTemp) / (initialTemp - targetTemp)) * 100 }}</div>
</template>
```

### メモ化の使用基準

- 計算コストが高い処理
- 大量のデータ処理
- コンポーネントの再レンダリング防止

```typescript
// ✅ Good: 重い計算は computed でメモ化
const temperatureHistory = computed(() => {
  return history.value.map(session => ({
    ...session,
    coolingRate: calculateCoolingRate(session),
  }));
});
```

### 大きなリストの処理

```vue
<!-- ✅ Good: v-for に key を必ず指定 -->
<div v-for="session in sessions" :key="session.id">
  {{ session.timestamp }}
</div>

<!-- ❌ Bad: key なし -->
<div v-for="session in sessions">
  {{ session.timestamp }}
</div>
```

---

## 禁止パターン

### マジックナンバー

```typescript
// ✅ Good: 定数化
const SHAKE_INTERVAL_SECONDS = 15;
const DEFAULT_TARGET_TEMP = 38;

if (timer % SHAKE_INTERVAL_SECONDS === 0) {
  triggerShakeReminder();
}

// ❌ Bad: マジックナンバー
if (timer % 15 === 0) {
  triggerShakeReminder();
}
```

### ネストの深すぎる条件分岐

```typescript
// ✅ Good: 早期リターン
const validateSettings = (settings: SessionSettings): boolean => {
  if (settings.volume <= 0) return false;
  if (settings.targetTemp < 36 || settings.targetTemp > 40) return false;
  if (!validMaterials.includes(settings.bottleMaterialId)) return false;
  return true;
};

// ❌ Bad: ネストが深い
const validateSettings = (settings: SessionSettings): boolean => {
  if (settings.volume > 0) {
    if (settings.targetTemp >= 36 && settings.targetTemp <= 40) {
      if (validMaterials.includes(settings.bottleMaterialId)) {
        return true;
      }
    }
  }
  return false;
};
```

---

## ESLint / Prettier設定

プロジェクトでは以下の設定を使用：

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

---

この規約に従うことで、チーム全体（Claude Codeを含む）で一貫性のあるコードを維持できます。
