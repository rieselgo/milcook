# 技術仕様書 - 粉ミルク調乳タイマー

本ドキュメントは [tech-stack-spec.md](tech-stack-spec.md) をベースに、より詳細な技術仕様を記述しています。

---

## 技術スタック詳細

### フロントエンド

#### Nuxt 3 (v3.13+)
**選定理由**:
- Vue 3の強力なエコシステム
- SSG（Static Site Generation）でFirebase Hostingに最適
- ファイルベースルーティング
- 自動インポート（コンポーネント、Composables）

**使用機能**:
- `pages/`: ファイルベースルーティング
- `composables/`: 再利用可能なロジック
- `layouts/`: ページレイアウト
- Auto-imports: ref, computed, useRouter等

#### TypeScript (v5.0+)
**設定** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### Tailwind CSS (v3.4+)
**カスタム設定** (`tailwind.config.ts`):
```typescript
export default {
  theme: {
    extend: {
      colors: {
        temp: {
          hot: '#FF6B35',
          warm: '#FF8C42',
          medium: '#FFB84D',
          cool: '#FFF066',
          cold: '#4CAF50',
        },
      },
      fontSize: {
        '10xl': '10rem',
      },
    },
  },
  darkMode: 'class',
};
```

#### Nuxt UI (shadcn/ui の Nuxt版)
**使用コンポーネント**:
- Button
- Card
- Input
- Modal
- Slider
- Radio Group

#### Pinia (Nuxt 3 標準)
**ストア設計**:
```typescript
// stores/settings.ts
export const useSettingsStore = defineStore('settings', () => {
  const volume = ref(140);
  const bottleMaterialId = ref('glass');
  const targetTemp = ref(38);

  return { volume, bottleMaterialId, targetTemp };
}, {
  persist: true, // localStorage に自動保存
});
```

#### VueUse Motion
**アニメーション例**:
```vue
<div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }">
  温度表示
</div>
```

#### Chart.js + vue-chartjs
**温度グラフ実装**:
```typescript
const chartData = computed(() => ({
  labels: timePoints.value,
  datasets: [{
    label: '温度',
    data: temperaturePoints.value,
    borderColor: '#FF6B35',
    tension: 0.4,
  }],
}));
```

---

## バックエンド・インフラ (Google優先)

### Firebase Hosting
**設定** (`firebase.json`):
```json
{
  "hosting": {
    "public": ".output/public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "headers": [{
      "source": "**/*.@(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)",
      "headers": [{
        "key": "Cache-Control",
        "value": "max-age=31536000, immutable"
      }]
    }]
  }
}
```

### IndexedDB (Dexie.js)
**スキーマ定義**:
```typescript
// plugins/dexie.client.ts
import Dexie, { Table } from 'dexie';

interface MilkSession {
  id?: number;
  timestamp: Date;
  volume: number;
  bottleMaterialId: string;
  coolingMethodId: string;
  predictedTime: number;
  actualTime?: number;
  stirCount?: number;
}

class MilkTimerDB extends Dexie {
  sessions!: Table<MilkSession>;

  constructor() {
    super('MilkTimerDB');
    this.version(1).stores({
      sessions: '++id, timestamp, volume, coolingMethodId',
    });
  }
}

export const db = new MilkTimerDB();
```

### Firebase Cloud Messaging (将来)
**プッシュ通知設定**:
```typescript
// plugins/firebase.client.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const config = useRuntimeConfig();
const app = initializeApp(config.public.firebase);
const messaging = getMessaging(app);
```

### Google Analytics 4
**イベント設計**:
```typescript
// イベント一覧
- timer_start: タイマー開始
- timer_complete: タイマー完了
- cooling_method_selected: 冷却方法選択
- shake_performed: 揺らし実行
```

---

## 熱力学計算エンジン

### 物理定数 (`utils/thermal/constants.ts`)

```typescript
// 水の物理定数
export const WATER_DENSITY = 1000; // kg/m³
export const WATER_SPECIFIC_HEAT = 4186; // J/(kg·K)

// 熱伝達係数の基準値
export const NATURAL_CONVECTION_H = 10; // W/(m²·K) 自然対流
export const FORCED_CONVECTION_H = 50; // W/(m²·K) 強制対流
```

### 材質パラメータ (`utils/thermal/materials.ts`)

```typescript
export const MATERIALS: Record<string, BottleMaterial> = {
  glass: {
    id: 'glass',
    name: 'ガラス',
    thermalConductivity: 1.0, // W/(m·K)
    thickness: 0.002, // m (2mm)
    density: 2500, // kg/m³
    specificHeat: 840, // J/(kg·K)
  },
  plastic: {
    id: 'plastic',
    name: 'プラスチック',
    thermalConductivity: 0.2,
    thickness: 0.003,
    density: 1200,
    specificHeat: 1200,
  },
  ppsu: {
    id: 'ppsu',
    name: 'PPSU',
    thermalConductivity: 0.26,
    thickness: 0.003,
    density: 1290,
    specificHeat: 1100,
  },
};
```

### 冷却方法パラメータ (`utils/thermal/methods.ts`)

```typescript
export const COOLING_METHODS: Record<string, CoolingMethod> = {
  ice_stir: {
    id: 'ice_stir',
    name: '氷水攪拌',
    description: '速くて節水、実用的',
    ambientTemp: 2, // °C
    velocity: 0.3, // m/s（攪拌による流速）
    baseH: 200, // W/(m²·K)
    velocityFactor: 1.5,
    recommendedPriority: 1,
  },
  ice_still: {
    id: 'ice_still',
    name: '氷水静置',
    description: '放置できて楽',
    ambientTemp: 2,
    velocity: 0, // 静止
    baseH: 50,
    velocityFactor: 1.0,
    recommendedPriority: 2,
  },
  running_water: {
    id: 'running_water',
    name: '流水冷却',
    description: '速いが水道代',
    ambientTemp: 15,
    velocity: 0.5,
    baseH: 300,
    velocityFactor: 2.0,
    recommendedPriority: 3,
  },
  ice_water_running: {
    id: 'ice_water_running',
    name: '氷水+流水',
    description: '最速',
    ambientTemp: 5,
    velocity: 0.7,
    baseH: 400,
    velocityFactor: 2.5,
    recommendedPriority: 4,
  },
  air: {
    id: 'air',
    name: '常温放置',
    description: '遅すぎる（非推奨）',
    ambientTemp: 20,
    velocity: 0,
    baseH: 10,
    velocityFactor: 1.0,
    recommendedPriority: 5,
  },
};
```

### 温度計算アルゴリズム (`utils/thermal/calculator.ts`)

#### ニュートンの冷却法則
```typescript
/**
 * ニュートンの冷却法則による温度計算
 *
 * T(t) = T_ambient + (T_initial - T_ambient) * exp(-k * t)
 *
 * @param initialTemp - 初期温度（°C）
 * @param elapsedTime - 経過時間（分）
 * @param ambient - 周囲温度（°C）
 * @param k - 冷却定数（1/分）
 * @returns 計算された温度（°C）
 */
export const calculateNewtonCooling = (
  initialTemp: number,
  elapsedTime: number,
  ambient: number,
  k: number
): number => {
  return ambient + (initialTemp - ambient) * Math.exp(-k * elapsedTime);
};
```

#### 冷却定数の計算
```typescript
/**
 * 冷却定数kの計算
 *
 * k = (h * A) / (m * c)
 *
 * h: 熱伝達係数 (W/(m²·K))
 * A: 表面積 (m²)
 * m: 質量 (kg)
 * c: 比熱 (J/(kg·K))
 */
export const calculateCoolingConstant = (
  volume: number, // ml
  material: BottleMaterial,
  method: CoolingMethod
): number => {
  // 質量計算
  const mass = (volume / 1000) * WATER_DENSITY; // kg

  // 表面積計算（円筒近似）
  const radius = 0.03; // m（半径3cm）
  const height = volume / (Math.PI * radius ** 2 * 1000); // m
  const area = 2 * Math.PI * radius * height; // m²

  // 熱伝達係数
  const h = method.baseH * Math.sqrt(method.velocity / 0.1 + 1);

  // 冷却定数（1/秒 → 1/分に変換）
  const k_per_second = (h * area) / (mass * WATER_SPECIFIC_HEAT);
  return k_per_second * 60;
};
```

#### 目標温度到達時間の予測
```typescript
/**
 * 目標温度到達時間の計算
 *
 * t = -ln((T_target - T_ambient) / (T_initial - T_ambient)) / k
 */
export const calculateTimeToTarget = (
  initialTemp: number,
  targetTemp: number,
  ambient: number,
  k: number
): number => {
  if (initialTemp <= targetTemp) return 0;
  const ratio = (targetTemp - ambient) / (initialTemp - ambient);
  if (ratio <= 0) return Infinity;
  return -Math.log(ratio) / k; // 分単位
};
```

---

## データ構造

### 型定義 (`types/session.ts`)

```typescript
export interface MilkSession {
  id?: number;
  timestamp: Date;

  // 設定
  volume: number; // ml
  bottleMaterialId: string;
  coolingMethodId: string;

  // 温度
  hotWaterTemp: number; // °C
  hotWaterVolume: number; // ml
  coldWaterTemp: number; // °C
  coldWaterVolume: number; // ml
  initialTemp: number; // 混合後の温度（°C）
  targetTemp: number; // °C

  // タイマー
  predictedTime: number; // 予測時間（秒）
  actualTime?: number; // 実測時間（秒）
  stirCount?: number; // 揺らした回数

  // ステータス
  completed: boolean;

  // 環境
  roomTemp?: number; // °C
  notes?: string; // メモ
}

export interface SessionSettings {
  volume: number;
  bottleMaterialId: string;
  targetTemp: number;
  roomTemp: number;
  coldWaterTemp: number;
}
```

---

## パフォーマンス要件

### 初期ロード最適化

#### コード分割
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'chart': ['chart.js', 'vue-chartjs'],
            'vendor': ['vue', 'vue-router'],
          },
        },
      },
    },
  },
});
```

#### 画像最適化
```vue
<!-- 遅延ロード -->
<NuxtImg
  src="/bottle.png"
  loading="lazy"
  width="200"
  height="300"
  format="webp"
/>
```

### タイマー精度

#### Web Worker使用
```typescript
// composables/useTimer.ts
const worker = new Worker('/timer-worker.js');

worker.postMessage({ type: 'START' });

worker.onmessage = (e) => {
  if (e.data.type === 'TICK') {
    elapsedTime.value += 1;
  }
};
```

**timer-worker.js**:
```javascript
let intervalId = null;

self.onmessage = (e) => {
  if (e.data.type === 'START') {
    intervalId = setInterval(() => {
      self.postMessage({ type: 'TICK' });
    }, 1000);
  } else if (e.data.type === 'STOP') {
    clearInterval(intervalId);
  }
};
```

---

## PWA設定

### Manifest (`public/manifest.json`)

```json
{
  "name": "粉ミルク調乳タイマー",
  "short_name": "調乳タイマー",
  "description": "科学的根拠に基づいた正確な調乳タイマー",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#FF6B35",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Service Worker戦略

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  pwa: {
    workbox: {
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
      ],
    },
  },
});
```

---

## ブラウザAPI使用

### Vibration API
```typescript
// composables/useVibration.ts
export const useVibration = () => {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const vibrateShakeReminder = () => {
    vibrate(200); // 200ms
  };

  const vibrateComplete = () => {
    vibrate([200, 100, 200, 100, 200]); // 3回
  };

  return { vibrate, vibrateShakeReminder, vibrateComplete };
};
```

### Notification API
```typescript
// composables/useNotification.ts
export const useNotification = () => {
  const requestPermission = async (): Promise<boolean> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const notify = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  return { requestPermission, notify };
};
```

---

## セキュリティ設定

### 環境変数 (`.env`)

```bash
# Firebase
NUXT_PUBLIC_FIREBASE_API_KEY=
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NUXT_PUBLIC_FIREBASE_PROJECT_ID=
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NUXT_PUBLIC_FIREBASE_APP_ID=
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### CSP (Content Security Policy)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          'http-equiv': 'Content-Security-Policy',
          content: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'",
        },
      ],
    },
  },
});
```

---

## テスト戦略

### ユニットテスト (Vitest)

```typescript
// utils/thermal/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateNewtonCooling, calculateTimeToTarget } from './calculator';

describe('calculateNewtonCooling', () => {
  it('経過時間0では初期温度を返す', () => {
    const result = calculateNewtonCooling(46.6, 0, 2, 0.2401);
    expect(result).toBe(46.6);
  });

  it('十分な時間経過で周囲温度に近づく', () => {
    const result = calculateNewtonCooling(46.6, 100, 2, 0.2401);
    expect(result).toBeCloseTo(2, 0);
  });

  it('氷水攪拌で約53秒後に38°Cになる', () => {
    const result = calculateNewtonCooling(46.6, 0.88, 2, 0.2401);
    expect(result).toBeCloseTo(38, 1);
  });
});

describe('calculateTimeToTarget', () => {
  it('正しい到達時間を計算する', () => {
    const time = calculateTimeToTarget(46.6, 38, 2, 0.2401);
    expect(time).toBeCloseTo(0.88, 1); // 約53秒
  });
});
```

### E2Eテスト (Playwright)

```typescript
// tests/e2e/timer.spec.ts
import { test, expect } from '@playwright/test';

test('タイマーの基本フロー', async ({ page }) => {
  await page.goto('/');

  // 新しく調乳する
  await page.click('text=調乳を始める');

  // 設定確認
  await expect(page).toHaveURL('/prepare');

  // 準備完了
  await page.click('text=準備完了');

  // 調乳ガイド
  await expect(page).toHaveURL('/guide');
  await page.click('text=完了 → 次へ');

  // 冷却方法選択
  await page.click('text=氷水攪拌');

  // タイマー画面
  await expect(page).toHaveURL('/timer');
  await expect(page.locator('text=経過時間')).toBeVisible();
});
```

---

このドキュメントに基づき、技術的な実装を進めてください。
