# デプロイガイド - 粉ミルク調乳タイマー

## 開発環境のセットアップ

### 1. 必要なツールのインストール

#### Node.js
```bash
# Node.js 20.x をインストール
# https://nodejs.org/

node --version  # v20.x.x を確認
```

#### pnpm
```bash
# pnpm をグローバルインストール
npm install -g pnpm

pnpm --version  # 8.x.x を確認
```

#### Firebase CLI
```bash
# Firebase CLI をインストール
npm install -g firebase-tools

firebase --version  # 12.x.x を確認

# Firebase にログイン
firebase login
```

---

### 2. プロジェクトのクローン

```bash
# リポジトリをクローン
git clone https://github.com/your-username/milcook.git
cd milcook

# 依存関係をインストール
pnpm install
```

---

### 3. 環境変数の設定

#### `.env` ファイルを作成

```bash
# .env.example をコピー
cp .env.example .env
```

#### Firebase プロジェクトの設定値を取得

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択（または新規作成）
3. プロジェクト設定 → マイアプリ → SDK の設定と構成
4. 設定値をコピーして `.env` に貼り付け

```bash
# .env
NUXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=milcook.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=milcook
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=milcook.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

### 4. 開発サーバーの起動

```bash
# 開発サーバーを起動
pnpm dev

# ブラウザで http://localhost:3000 を開く
```

---

## ビルド手順

### ローカルビルド

```bash
# 本番用ビルド（SSG）
pnpm generate

# 出力先: .output/public/
```

### ビルド確認

```bash
# ビルド結果をローカルでプレビュー
pnpm preview

# ブラウザで http://localhost:3000 を開く
```

---

## Firebase設定

### 1. Firebase プロジェクトの初期化

```bash
# Firebase プロジェクトを初期化
firebase init

# 以下を選択:
# - Hosting: Configure files for Firebase Hosting
# - Use an existing project: milcook (or create new)
# - Public directory: .output/public
# - Configure as single-page app: Yes
# - Set up automatic builds and deploys with GitHub: No (後で設定)
```

#### `firebase.json` の設定

```json
{
  "hosting": {
    "public": ".output/public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(html|json)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

---

### 2. Firebase Hosting へのデプロイ

#### 手動デプロイ

```bash
# ビルド
pnpm generate

# デプロイ
firebase deploy --only hosting

# デプロイ完了後、URLが表示される
# ✔  Deploy complete!
# Hosting URL: https://milcook.web.app
```

#### カスタムドメインの設定（オプション）

1. Firebase Console → Hosting
2. 「カスタムドメインを追加」
3. ドメインを入力（例: milcook.app）
4. DNS設定を更新（指示に従う）

---

## CI/CD設定（GitHub Actions）

### 1. GitHub Secrets の設定

GitHub リポジトリの Settings → Secrets and variables → Actions で以下を追加:

```
FIREBASE_TOKEN: <firebase login:ci で取得したトークン>
```

トークン取得方法:
```bash
firebase login:ci
# トークンが表示されるのでコピー
```

---

### 2. GitHub Actions ワークフロー

#### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm generate
        env:
          NUXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NUXT_PUBLIC_FIREBASE_API_KEY }}
          NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NUXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NUXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NUXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NUXT_PUBLIC_FIREBASE_APP_ID }}
          NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${{ secrets.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID }}

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: milcook
```

---

## Lighthouse スコアの最適化

### 目標
- **Performance**: 90点以上
- **Accessibility**: 95点以上
- **Best Practices**: 95点以上
- **SEO**: 90点以上

### パフォーマンス最適化

#### 画像最適化
```vue
<!-- WebP形式で配信 -->
<NuxtImg
  src="/bottle.png"
  format="webp"
  loading="lazy"
  width="200"
  height="300"
  alt="哺乳瓶"
/>
```

#### フォント最適化
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap',
        },
      ],
    },
  },
});
```

#### コード分割
```typescript
// 動的インポート
const HeavyComponent = defineAsyncComponent(
  () => import('~/components/HeavyComponent.vue')
);
```

---

## モニタリング

### Google Analytics 4

#### 設定

```typescript
// plugins/gtag.client.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Google Analytics初期化
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.public.firebase.measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', config.public.firebase.measurementId);
});
```

#### イベント送信
```typescript
// utils/analytics.ts
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params);
  }
};

// 使用例
trackEvent('timer_start', {
  volume: 140,
  material: 'glass',
  method: 'ice_stir',
});
```

---

## エラートラッキング（将来）

### Sentry設定

```bash
pnpm add @sentry/vue
```

```typescript
// plugins/sentry.client.ts
import * as Sentry from '@sentry/vue';

export default defineNuxtPlugin((nuxtApp) => {
  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: 'https://xxx@sentry.io/xxx',
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
});
```

---

## デプロイチェックリスト

### デプロイ前

- [ ] すべてのテストが通る（`pnpm test`）
- [ ] Lintエラーがない（`pnpm lint`）
- [ ] 型エラーがない（`pnpm nuxi typecheck`）
- [ ] ビルドが成功する（`pnpm generate`）
- [ ] Lighthouseスコアが目標値以上
- [ ] 環境変数が正しく設定されている
- [ ] `.env` ファイルが `.gitignore` に含まれている

### デプロイ後

- [ ] 本番環境で動作確認
- [ ] 各ページが正しく表示される
- [ ] タイマー機能が正常動作
- [ ] PWAとしてインストール可能
- [ ] バイブレーション・通知が動作
- [ ] Google Analyticsが動作
- [ ] エラーログが正常に送信される（Sentry等）

---

## ロールバック手順

### Firebase Hosting

```bash
# デプロイ履歴を確認
firebase hosting:channel:list

# 前のバージョンにロールバック
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

### GitHub Actions

1. GitHub の Actions タブ
2. 前回成功したワークフローを選択
3. 「Re-run all jobs」

---

## トラブルシューティング

### ビルドエラー

#### エラー: `Module not found`
```bash
# node_modules を削除して再インストール
rm -rf node_modules
pnpm install
```

#### エラー: `Type error`
```bash
# 型チェック
pnpm nuxi typecheck

# .nuxt を削除して再生成
rm -rf .nuxt
pnpm dev
```

### デプロイエラー

#### エラー: `Firebase authentication failed`
```bash
# 再ログイン
firebase logout
firebase login
```

#### エラー: `Permission denied`
```bash
# Firebase プロジェクトの確認
firebase projects:list

# プロジェクトを切り替え
firebase use milcook
```

---

## パフォーマンスモニタリング

### Core Web Vitals

目標値:
- **LCP (Largest Contentful Paint)**: 2.5秒以下
- **FID (First Input Delay)**: 100ms以下
- **CLS (Cumulative Layout Shift)**: 0.1以下

### 計測方法

```typescript
// composables/useWebVitals.ts
export const useWebVitals = () => {
  if (process.client) {
    import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
      getCLS(console.log);
      getFID(console.log);
      getLCP(console.log);
    });
  }
};
```

---

このデプロイガイドに従うことで、安全かつ確実にアプリケーションをデプロイできます。
