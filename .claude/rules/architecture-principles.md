# アーキテクチャ原則 - 粉ミルク調乳タイマー

## 設計原則

### 1. 単一責任の原則 (Single Responsibility Principle)

各モジュール・クラス・関数は1つの責務のみを持つ

```typescript
// ✅ Good: 責務が明確
class TemperatureCalculator {
  calculate(params: ThermalParams): number {
    // 温度計算のみ
  }
}

class TemperatureFormatter {
  format(temp: number): string {
    // フォーマットのみ
  }
}

// ❌ Bad: 複数の責務
class Temperature {
  calculate(params: ThermalParams): number {
    // 計算もフォーマットも行う
  }
  format(temp: number): string {}
  save(temp: number): void {}
}
```

### 2. 開放閉鎖の原則 (Open-Closed Principle)

拡張に対しては開いていて、修正に対しては閉じている

```typescript
// ✅ Good: 新しい冷却方法の追加が容易
interface CoolingMethod {
  id: string;
  calculate(temp: number, time: number): number;
}

class IceStirMethod implements CoolingMethod {
  id = 'ice_stir';
  calculate(temp: number, time: number): number {
    // 氷水攪拌の計算
  }
}

class RunningWaterMethod implements CoolingMethod {
  id = 'running_water';
  calculate(temp: number, time: number): number {
    // 流水の計算
  }
}

// 新しい方法を追加する際、既存コードを変更不要
```

### 3. 依存性逆転の原則 (Dependency Inversion Principle)

具象ではなく抽象に依存する

```typescript
// ✅ Good: インターフェースに依存
interface HistoryRepository {
  save(session: MilkSession): Promise<void>;
  findAll(): Promise<MilkSession[]>;
}

class IndexedDBRepository implements HistoryRepository {
  async save(session: MilkSession): Promise<void> {
    // IndexedDB実装
  }
  async findAll(): Promise<MilkSession[]> {
    // ...
  }
}

// 将来、FirestoreやLocalStorageに切り替えやすい
class FirestoreRepository implements HistoryRepository {
  // ...
}
```

### 4. DRY (Don't Repeat Yourself)

重複を避け、共通化する

```typescript
// ✅ Good: 共通化
const formatTemperature = (temp: number): string => {
  return `${temp.toFixed(1)}°C`;
};

// 複数箇所で使用
const displayTemp1 = formatTemperature(38.5);
const displayTemp2 = formatTemperature(46.6);

// ❌ Bad: 重複
const displayTemp1 = `${temp1.toFixed(1)}°C`;
const displayTemp2 = `${temp2.toFixed(1)}°C`;
```

### 5. KISS (Keep It Simple, Stupid)

シンプルに保つ

```typescript
// ✅ Good: シンプル
const isValidTemperature = (temp: number): boolean => {
  return temp >= 36 && temp <= 40;
};

// ❌ Bad: 複雑すぎ
const isValidTemperature = (temp: number): boolean => {
  const minTemp = 36;
  const maxTemp = 40;
  if (temp < minTemp) {
    return false;
  } else if (temp > maxTemp) {
    return false;
  } else {
    return true;
  }
};
```

---

## レイヤー構造

### アーキテクチャ図

```
┌─────────────────────────────────────────┐
│     Presentation Layer (UI)             │
│  Pages / Components / Layouts           │
└─────────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────────┐
│     Application Layer (Logic)           │
│  Composables / Stores (Pinia)           │
└─────────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────────┐
│     Domain Layer (Business Logic)       │
│  Utils / Types / Constants              │
└─────────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────────┐
│     Infrastructure Layer (I/O)          │
│  Plugins / API / Storage                │
└─────────────────────────────────────────┘
```

### 各レイヤーの責務

#### Presentation Layer
- UIの表示・ユーザー入力の受付
- コンポーネントの組み立て
- ページ遷移の制御

```vue
<!-- pages/timer.vue -->
<script setup lang="ts">
import { useTimer } from '~/composables/useTimer';
import BottleVisual from '~/components/bottle/BottleVisual.vue';

const { currentTemp, progress, start, pause } = useTimer();
</script>
```

#### Application Layer
- ビジネスロジックの組み立て
- 状態管理
- UIとDomain層の橋渡し

```typescript
// composables/useTimer.ts
export const useTimer = () => {
  const timerStore = useTimerStore();
  const { calculateTemperature } = useThermalEngine();

  const currentTemp = computed(() => {
    return calculateTemperature(/* params */);
  });

  return { currentTemp, start, pause };
};
```

#### Domain Layer
- 純粋な計算ロジック
- ビジネスルールの実装
- 型定義

```typescript
// utils/thermal/calculator.ts
export const calculateNewtonCooling = (
  initialTemp: number,
  elapsedTime: number,
  ambient: number,
  k: number
): number => {
  return ambient + (initialTemp - ambient) * Math.exp(-k * elapsedTime);
};
```

#### Infrastructure Layer
- 外部API通信
- データベースアクセス
- ブラウザAPI（Vibration, Notification）

```typescript
// plugins/dexie.client.ts
import Dexie from 'dexie';

export const db = new Dexie('MilkTimerDB');
db.version(1).stores({
  sessions: '++id, timestamp, volume',
});
```

---

## コンポーネント設計

### Atomic Design の適用

```
components/
├── atoms/              # 最小単位
│   ├── Button.vue
│   ├── Input.vue
│   └── Icon.vue
├── molecules/          # 原子の組み合わせ
│   ├── TemperatureDisplay.vue
│   ├── ProgressBar.vue
│   └── ShakeButton.vue
├── organisms/          # 分子の組み合わせ
│   ├── TimerControl.vue
│   ├── BottleVisual.vue
│   └── HistoryList.vue
└── templates/          # ページテンプレート
    ├── TimerTemplate.vue
    └── SettingsTemplate.vue
```

### Atoms（原子）
- 再利用可能な最小単位
- プロジェクト固有のロジックを持たない
- プロパティで動作をカスタマイズ

```vue
<!-- components/atoms/Button.vue -->
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
});
</script>
```

### Molecules（分子）
- 複数のAtomsを組み合わせ
- 1つの明確な目的を持つ

```vue
<!-- components/molecules/TemperatureDisplay.vue -->
<script setup lang="ts">
interface Props {
  temperature: number;
  label?: string;
}

const props = defineProps<Props>();
const color = computed(() => getTempColor(props.temperature));
</script>

<template>
  <div class="temperature-display">
    <span v-if="label" class="label">{{ label }}</span>
    <span class="value" :style="{ color }">
      {{ temperature.toFixed(1) }}°C
    </span>
  </div>
</template>
```

### Organisms（有機体）
- 複雑な機能を持つコンポーネント
- ビジネスロジックを含む

```vue
<!-- components/organisms/TimerControl.vue -->
<script setup lang="ts">
import { useTimer } from '~/composables/useTimer';
import Button from '~/components/atoms/Button.vue';
import ProgressBar from '~/components/molecules/ProgressBar.vue';

const { isRunning, progress, start, pause, reset } = useTimer();
</script>
```

### Props の設計原則

```typescript
// ✅ Good: 明確な型定義
interface BottleVisualProps {
  temperature: number;        // 必須
  targetTemp: number;          // 必須
  size?: 'sm' | 'md' | 'lg';  // オプション
  animated?: boolean;          // オプション
}

// ❌ Bad: 曖昧な型
interface BadProps {
  data: any;
  config?: object;
}
```

### イベントの命名規則

```vue
<!-- ✅ Good: on + 動詞 -->
<script setup lang="ts">
interface Emits {
  (e: 'start'): void;
  (e: 'pause'): void;
  (e: 'resume'): void;
  (e: 'complete', temperature: number): void;
}

const emit = defineEmits<Emits>();
</script>

<!-- 親コンポーネントで使用 -->
<TimerControl
  @start="handleStart"
  @pause="handlePause"
  @complete="handleComplete"
/>
```

---

## 状態管理

### Pinia の使用方針

```typescript
// stores/timer.ts
import { defineStore } from 'pinia';

export const useTimerStore = defineStore('timer', () => {
  // State
  const isRunning = ref(false);
  const elapsedTime = ref(0);
  const currentTemp = ref(46.6);

  // Getters
  const progress = computed(() => {
    return (initialTemp - currentTemp.value) / (initialTemp - targetTemp) * 100;
  });

  // Actions
  const start = () => {
    isRunning.value = true;
  };

  const pause = () => {
    isRunning.value = false;
  };

  return { isRunning, elapsedTime, currentTemp, progress, start, pause };
});
```

### グローバル状態 vs ローカル状態

**グローバル状態（Store）**
- 複数のページで共有するデータ
- ユーザー設定（ミルク量、材質、目標温度）
- タイマーの状態
- 履歴データ

**ローカル状態（ref/reactive）**
- 1つのコンポーネント内でのみ使用
- UIの一時的な状態（モーダルの開閉など）
- フォーム入力値

### 状態の正規化

```typescript
// ✅ Good: 正規化
interface State {
  sessions: Record<string, MilkSession>;  // ID -> Session
  sessionIds: string[];                   // 順序を保持
}

// ❌ Bad: 非正規化（検索が遅い）
interface BadState {
  sessions: MilkSession[];
}
```

---

## ファイル・ディレクトリ構成

### 機能ごとのグルーピング

```
components/
├── timer/              # タイマー機能
│   ├── TimerDisplay.vue
│   ├── ProgressBar.vue
│   └── ShakeReminder.vue
├── bottle/             # 哺乳瓶ビジュアル
│   ├── BottleVisual.vue
│   └── TemperatureGradient.vue
└── settings/           # 設定
    ├── VolumeSelector.vue
    └── MaterialSelector.vue
```

### 共通コンポーネントの配置

```
components/
└── ui/                 # 共通UIコンポーネント
    ├── Button.vue
    ├── Card.vue
    ├── Modal.vue
    └── Input.vue
```

### テストファイルの配置規則

```
utils/
├── thermal/
│   ├── calculator.ts
│   └── calculator.test.ts    # 同じディレクトリ
└── color.ts
    └── color.test.ts
```

---

## 依存関係の管理

### 循環依存の禁止

```typescript
// ❌ Bad: 循環依存
// fileA.ts
import { funcB } from './fileB';

// fileB.ts
import { funcA } from './fileA';

// ✅ Good: 共通のユーティリティに抽出
// utils.ts
export const commonFunc = () => {};

// fileA.ts
import { commonFunc } from './utils';

// fileB.ts
import { commonFunc } from './utils';
```

### 外部ライブラリの最小化

- 必要最小限のライブラリのみ使用
- バンドルサイズを意識
- 同じ機能のライブラリを複数導入しない

```json
// ✅ Good: 必要最小限
{
  "dependencies": {
    "nuxt": "^3.13.0",
    "vue": "^3.4.0",
    "chart.js": "^4.4.0"
  }
}

// ❌ Bad: 重複機能のライブラリ
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "recharts": "^2.0.0",  // chart.jsと重複
    "d3": "^7.0.0"         // chart.jsと重複
  }
}
```

### バージョン固定の方針

- メジャーバージョンは固定（`^` を使用）
- セキュリティアップデートは速やかに適用
- 定期的な依存関係の更新

```json
{
  "dependencies": {
    "nuxt": "^3.13.0",     // 3.x.x の最新
    "vue": "^3.4.0"        // 3.x.x の最新
  }
}
```

---

## データフロー

### 単方向データフロー

```
User Action → Event → Store → Computed → UI
     ↑                                   ↓
     └───────────────────────────────────┘
```

```vue
<!-- ✅ Good: 単方向フロー -->
<script setup lang="ts">
const store = useTimerStore();

// Store → UI
const temperature = computed(() => store.currentTemp);

// UI → Store
const handleStart = () => {
  store.start();
};
</script>

<template>
  <div>
    <p>{{ temperature }}°C</p>
    <button @click="handleStart">開始</button>
  </div>
</template>
```

---

## パフォーマンス最適化

### コード分割

```typescript
// ✅ Good: 動的インポート
const HeavyComponent = defineAsyncComponent(
  () => import('~/components/HeavyComponent.vue')
);
```

### 遅延ロード

```vue
<!-- ✅ Good: 画像の遅延ロード -->
<img src="bottle.png" loading="lazy" alt="哺乳瓶" />
```

---

このアーキテクチャ原則に従うことで、保守性・拡張性の高いアプリケーションを構築できます。
