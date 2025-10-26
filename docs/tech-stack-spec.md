# 粉ミルク調乳タイマー 技術仕様書

## 🏗️ 技術スタック

### フロントエンド
- **フレームワーク**: Nuxt 3 (v3.13+)
- **言語**: TypeScript (v5.0+)
- **UIフレームワーク**: Tailwind CSS (v3.4+)
- **UIコンポーネント**: Nuxt UI (shadcn/ui の Nuxt版)
- **状態管理**: Pinia (Nuxt 3 標準)
- **アニメーション**: 
  - VueUse Motion (Vue/Nuxt最適化)
  - CSS Transitions/Animations
- **グラフ**: Chart.js + vue-chartjs
- **アイコン**: Nuxt Icon (Iconify経由)

### バックエンド・インフラ (Google優先)
- **ホスティング**: Firebase Hosting
- **認証**: Firebase Authentication (将来の拡張用)
- **データベース**: 
  - ローカル: IndexedDB (Dexie.js)
  - クラウド同期: Firestore (オプション)
- **ストレージ**: Firebase Storage (画像等、将来用)
- **関数**: Cloud Functions for Firebase (API、将来用)
- **アナリティクス**: Google Analytics 4

### PWA
- **Service Worker**: Workbox (Nuxt PWA Module)
- **Push通知**: Firebase Cloud Messaging (FCM)
- **オフライン対応**: Workbox Strategies

### 開発・デプロイ
- **パッケージマネージャー**: pnpm
- **Linter/Formatter**: ESLint + Prettier
- **テスト**: Vitest (ユニット) + Playwright (E2E)
- **CI/CD**: GitHub Actions → Firebase Hosting
- **バージョン管理**: Git + GitHub

---

## 📁 プロジェクト構造

```
milk-timer/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD設定
├── .nuxt/                      # Nuxt自動生成（git ignore）
├── assets/
│   ├── css/
│   │   └── tailwind.css        # Tailwindカスタム設定
│   └── images/
│       └── bottle.svg          # 哺乳瓶SVG
├── components/
│   ├── bottle/
│   │   ├── BottleVisual.vue    # 哺乳瓶ビジュアル
│   │   └── TemperatureGradient.vue # 温度グラデーション
│   ├── timer/
│   │   ├── TimerDisplay.vue    # タイマー表示
│   │   ├── TemperatureChart.vue # 温度グラフ
│   │   ├── ProgressBar.vue     # 進捗バー
│   │   └── ShakeReminder.vue   # 揺らしリマインダー
│   ├── settings/
│   │   ├── VolumeSelector.vue  # ミルク量選択
│   │   ├── MaterialSelector.vue # 材質選択
│   │   └── MethodSelector.vue  # 冷却方法選択
│   └── ui/                     # 共通UIコンポーネント
│       ├── Button.vue
│       ├── Card.vue
│       └── Modal.vue
├── composables/
│   ├── useThermalEngine.ts     # 熱力学計算エンジン
│   ├── useTimer.ts             # タイマーロジック
│   ├── useVibration.ts         # バイブレーション
│   ├── useNotification.ts      # 通知
│   └── useHistory.ts           # 履歴管理
├── layouts/
│   └── default.vue             # デフォルトレイアウト
├── middleware/
│   └── pwa.ts                  # PWA関連ミドルウェア
├── pages/
│   ├── index.vue               # ホーム画面
│   ├── prepare.vue             # 準備チェックリスト
│   ├── settings.vue            # 設定画面
│   ├── guide.vue               # 調乳ガイド
│   ├── cooling.vue             # 冷却方法選択
│   ├── timer.vue               # タイマー実行
│   ├── complete.vue            # 完了画面
│   └── history.vue             # 履歴画面
├── plugins/
│   ├── firebase.client.ts      # Firebase初期化
│   ├── dexie.client.ts         # IndexedDB初期化
│   └── pwa.client.ts           # PWA初期化
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   ├── favicon.ico
│   └── icons/                  # PWAアイコン各サイズ
├── server/                     # Nuxt Server（将来のAPI用）
├── stores/
│   ├── settings.ts             # 設定ストア (Pinia)
│   ├── timer.ts                # タイマーストア
│   └── history.ts              # 履歴ストア
├── types/
│   ├── bottle.ts               # 哺乳瓶型定義
│   ├── cooling.ts              # 冷却方法型定義
│   ├── session.ts              # セッション型定義
│   └── thermal.ts              # 熱力学計算型定義
├── utils/
│   ├── thermal/
│   │   ├── constants.ts        # 物理定数
│   │   ├── materials.ts        # 材質パラメータ
│   │   ├── methods.ts          # 冷却方法パラメータ
│   │   └── calculator.ts       # 温度計算関数
│   ├── color.ts                # 色補間関数
│   └── format.ts               # フォーマット関数
├── .env.example                # 環境変数テンプレート
├── .gitignore
├── firebase.json               # Firebase設定
├── nuxt.config.ts              # Nuxt設定
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts          # Tailwind設定
├── tsconfig.json               # TypeScript設定
└── README.md
```

---

## 🔧 主要設定ファイル

### `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
  ],
  
  app: {
    head: {
      title: '粉ミルク調乳タイマー',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: '科学的根拠に基づいた正確な調乳タイマー' },
        { name: 'theme-color', content: '#FF6B35' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
      ],
    },
  },
  
  css: ['~/assets/css/tailwind.css'],
  
  pwa: {
    manifest: {
      name: '粉ミルク調乳タイマー',
      short_name: '調乳タイマー',
      description: '科学的根拠に基づいた正確な調乳タイマー',
      theme_color: '#FF6B35',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
  },
  
  typescript: {
    strict: true,
    typeCheck: true,
  },
  
  runtimeConfig: {
    public: {
      firebase: {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      },
    },
  },
})
```

### `package.json`

```json
{
  "name": "milk-timer",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest",
    "test:e2e": "playwright test",
    "deploy": "firebase deploy --only hosting"
  },
  "dependencies": {
    "nuxt": "^3.13.0",
    "vue": "^3.4.0",
    "@nuxt/ui": "^2.18.0",
    "@pinia/nuxt": "^0.5.0",
    "@vueuse/core": "^11.0.0",
    "@vueuse/nuxt": "^11.0.0",
    "firebase": "^10.13.0",
    "dexie": "^4.0.0",
    "chart.js": "^4.4.0",
    "vue-chartjs": "^5.3.0"
  },
  "devDependencies": {
    "@nuxtjs/tailwindcss": "^6.12.0",
    "@vite-pwa/nuxt": "^0.10.0",
    "@types/node": "^20.14.0",
    "typescript": "^5.5.0",
    "eslint": "^9.9.0",
    "@nuxt/eslint": "^0.5.0",
    "prettier": "^3.3.0",
    "vitest": "^2.0.0",
    "@playwright/test": "^1.46.0"
  }
}
```

### `.env.example`

```bash
# Firebase設定
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### `firebase.json`

```json
{
  "hosting": {
    "public": ".output/public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

---

## 📦 主要な型定義

### `types/thermal.ts`

```typescript
export interface BottleMaterial {
  id: 'glass' | 'plastic' | 'ppsu'
  name: string
  thermalConductivity: number // W/(m·K)
  thickness: number // m
  density: number // kg/m³
  specificHeat: number // J/(kg·K)
}

export interface CoolingMethod {
  id: 'ice_stir' | 'ice_still' | 'running_water' | 'ice_water_running' | 'air'
  name: string
  description: string
  ambientTemp: number // °C
  velocity: number // m/s
  baseH: number // W/(m²·K)
  velocityFactor: number
  recommendedPriority: number // 1=最推奨
}

export interface ThermalCalculationParams {
  initialTemp: number
  targetTemp: number
  volume: number
  bottleMaterial: BottleMaterial
  coolingMethod: CoolingMethod
  roomTemp?: number
}

export interface ThermalCalculationResult {
  currentTemp: number
  coolingRate: number // °C/min
  timeToTarget: number // minutes
  progress: number // 0-1
}
```

### `types/session.ts`

```typescript
export interface MilkSession {
  id: string
  timestamp: Date
  volume: number // ml
  bottleMaterialId: string
  coolingMethodId: string
  hotWaterTemp: number
  hotWaterVolume: number
  coldWaterTemp: number
  coldWaterVolume: number
  initialTemp: number
  targetTemp: number
  predictedTime: number // seconds
  actualTime?: number // seconds
  stirCount?: number
  completed: boolean
}

export interface SessionSettings {
  volume: number
  bottleMaterialId: string
  targetTemp: number
  roomTemp: number
  coldWaterTemp: number
}
```

---

## 🔥 Firebase設定手順

### 1. Firebaseプロジェクト作成

```bash
# Firebase CLIインストール
npm install -g firebase-tools

# Firebaseログイン
firebase login

# プロジェクト初期化
firebase init

# 選択項目:
# - Hosting: Configure files for Firebase Hosting
# - Use an existing project (または新規作成)
```

### 2. Firebaseコンソールでの設定

1. **Firebase Console** (https://console.firebase.google.com/) にアクセス
2. プロジェクト作成
3. **Hosting** を有効化
4. **Web アプリを追加**してAPIキー等を取得
5. `.env` ファイルに設定値をコピー

### 3. オプション機能（将来）

- **Authentication**: メール/Googleログイン
- **Firestore**: 履歴のクラウド同期
- **Cloud Messaging**: プッシュ通知
- **Analytics**: 利用統計

---

## 🚀 開発・デプロイコマンド

### 開発環境

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm dev
# → http://localhost:3000

# 型チェック
pnpm nuxi typecheck

# Lint
pnpm lint

# テスト
pnpm test
```

### ビルド・デプロイ

```bash
# 本番ビルド（SSG）
pnpm generate

# ローカルでプレビュー
pnpm preview

# Firebaseへデプロイ
pnpm deploy

# または
firebase deploy --only hosting
```

---

## 🤖 Claude Code向けの実装ガイドライン

### ディレクトリ構造の原則

1. **機能ごとに分割**: コンポーネント、composables、utilsは機能単位で整理
2. **型定義を優先**: 実装前に `types/` で型を定義
3. **再利用可能に**: 共通ロジックは `composables/` や `utils/` へ
4. **単一責任**: 1つのファイルは1つの責務

### 実装順序（推奨）

#### Phase 1: 基盤構築（1-2日）
```bash
# 1. プロジェクト初期化
pnpm dlx nuxi@latest init milk-timer
cd milk-timer
pnpm install

# 2. 必要なパッケージ追加
pnpm add @nuxt/ui @pinia/nuxt @vueuse/nuxt firebase dexie chart.js vue-chartjs
pnpm add -D @nuxtjs/tailwindcss @vite-pwa/nuxt

# 3. 設定ファイル作成
- nuxt.config.ts
- tailwind.config.ts
- firebase.json
- .env

# 4. 型定義作成
- types/thermal.ts
- types/session.ts
- types/bottle.ts
- types/cooling.ts
```

#### Phase 2: 熱力学エンジン（2-3日）
```bash
# 実装順序
1. utils/thermal/constants.ts     # 物理定数
2. utils/thermal/materials.ts     # 材質パラメータ
3. utils/thermal/methods.ts       # 冷却方法パラメータ
4. utils/thermal/calculator.ts    # 計算ロジック
5. composables/useThermalEngine.ts # Composable化
6. テスト: tests/thermal.test.ts
```

#### Phase 3: 基本UI（3-4日）
```bash
# 実装順序
1. layouts/default.vue            # レイアウト
2. components/ui/*                # 基本コンポーネント
3. pages/index.vue                # ホーム画面
4. pages/settings.vue             # 設定画面
5. stores/settings.ts             # 設定ストア
```

#### Phase 4: タイマー機能（4-5日）
```bash
# 実装順序
1. composables/useTimer.ts        # タイマーロジック
2. components/timer/TimerDisplay.vue
3. components/bottle/BottleVisual.vue # 哺乳瓶ビジュアル
4. components/timer/TemperatureChart.vue
5. pages/timer.vue                # タイマー画面
6. stores/timer.ts                # タイマーストア
```

#### Phase 5: 通知・バイブ（2日）
```bash
# 実装順序
1. composables/useVibration.ts    # バイブレーション
2. composables/useNotification.ts # 通知
3. components/timer/ShakeReminder.vue # 揺らしリマインダー
```

#### Phase 6: 履歴機能（2-3日）
```bash
# 実装順序
1. plugins/dexie.client.ts        # IndexedDB初期化
2. composables/useHistory.ts      # 履歴管理
3. pages/history.vue              # 履歴画面
4. stores/history.ts              # 履歴ストア
```

#### Phase 7: PWA化（2日）
```bash
# 実装順序
1. public/manifest.json           # PWA manifest
2. plugins/pwa.client.ts          # PWA初期化
3. PWAアイコン生成
4. Service Worker設定
```

### コーディング規約

```typescript
// ✅ Good: 型定義を明示
interface TimerProps {
  initialTemp: number
  targetTemp: number
}

const startTimer = (props: TimerProps): void => {
  // ...
}

// ✅ Good: Composableの命名
export const useThermalEngine = () => {
  // ...
}

// ✅ Good: コンポーネントの命名
// BottleVisual.vue, TemperatureChart.vue

// ❌ Bad: any型の使用
const data: any = {} // 避ける

// ❌ Bad: 長すぎる関数
const doEverything = () => {
  // 100行以上... → 分割すべき
}
```

### テストの書き方

```typescript
// tests/thermal.test.ts
import { describe, it, expect } from 'vitest'
import { calculateTemperature } from '~/utils/thermal/calculator'

describe('Thermal Calculator', () => {
  it('氷水攪拌でガラス瓶が正しく冷却される', () => {
    const result = calculateTemperature({
      initialTemp: 46.6,
      elapsedTime: 0.89, // 53秒
      material: 'glass',
      method: 'ice_stir',
    })
    
    expect(result.currentTemp).toBeCloseTo(38, 1)
  })
})
```

---

## 📚 参考リンク

### 公式ドキュメント
- [Nuxt 3](https://nuxt.com/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Pinia](https://pinia.vuejs.org/)
- [VueUse](https://vueuse.org/)
- [Firebase](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)

### ツール
- [Vite PWA](https://vite-pwa-org.netlify.app/)
- [Dexie.js](https://dexie.org/)
- [Chart.js](https://www.chartjs.org/)

---

## ✅ 初期セットアップチェックリスト

```bash
□ Node.js 18+ インストール確認
□ pnpm インストール
□ Firebase CLI インストール
□ Firebaseプロジェクト作成
□ GitHub リポジトリ作成
□ .env ファイル作成（APIキー設定）
□ pnpm install 実行
□ pnpm dev で開発サーバー起動確認
□ PWAアイコン生成
```

---

## 🎯 Claude Codeへの指示例

```markdown
# 指示例1: プロジェクト初期化
「milk-timerプロジェクトをNuxt 3 + TypeScriptで初期化してください。
技術仕様書に従って、package.jsonとnuxt.config.tsを設定してください。」

# 指示例2: 熱力学エンジン実装
「utils/thermal/配下に熱力学計算エンジンを実装してください。
types/thermal.tsの型定義を参照し、calculator.tsに温度計算ロジックを実装してください。」

# 指示例3: 哺乳瓶ビジュアル実装
「components/bottle/BottleVisual.vueを実装してください。
温度に応じてSVGグラデーションが変化する哺乳瓶のビジュアルを作成してください。
46°Cはオレンジ、38°Cはグリーンになるように色補間してください。」
```

---

この技術仕様書を元にClaude Codeで開発を進められます！