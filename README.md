# 🍼 みるくっく (milcook)

科学的根拠に基づいた粉ミルク調乳タイマーPWA

[![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-99-brightgreen)](https://github.com/rieselgo/milcook)
[![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-94-brightgreen)](https://github.com/rieselgo/milcook)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

**🌐 本番URL**: https://milcook.vercel.app

## 概要

みるくっくは、赤ちゃんの粉ミルク調乳を安全・正確・効率的にサポートするWebアプリケーションです。
ニュートンの冷却法則に基づいた熱力学計算エンジンにより、科学的に正確な冷却時間を予測します。

### 主な特徴

- **科学的根拠に基づいた冷却時間予測**
  - ニュートンの冷却法則による正確な温度計算
  - 哺乳瓶の材質(ガラス/プラスチック/PPSU)を考慮
  - 5種類の冷却方法に対応(氷水攪拌/氷水静置/流水冷却など)

- **シンプルで使いやすいUI**
  - クイックスタート機能(よく使う設定で即開始)
  - ステップバイステップのガイド
  - リアルタイム温度表示と残り時間予測

- **調乳の記録と振り返り**
  - 過去の調乳履歴を自動保存
  - 時刻や所要時間の記録
  - 夜間モード対応

## 技術スタック

- **フレームワーク**: Nuxt 3 (Vue 3)
- **言語**: TypeScript (strict mode)
- **状態管理**: Pinia
- **スタイリング**: Tailwind CSS, Nuxt UI
- **テスト**: Vitest, Playwright
- **データベース**: Dexie.js (IndexedDB)
- **チャート**: Chart.js, vue-chartjs

## セットアップ

### 必要要件

- Node.js 18以上
- npm, pnpm, yarn, bunのいずれか

### インストール

```bash
# 依存関係をインストール
npm install
```

### 開発サーバー

```bash
# 開発サーバーを起動 (http://localhost:3000)
npm run dev
```

### テスト

```bash
# 単体テストを実行
npm run test

# E2Eテストを実行
npm run test:e2e
```

### ビルド

```bash
# 本番用ビルド
npm run build

# プレビュー
npm run preview
```

## プロジェクト構成

```
milcook/
├── .claude/              # Claudeのルールとメタ情報
├── docs/                 # 開発ドキュメント
├── types/                # TypeScript型定義
│   ├── thermal.ts        # 熱力学計算の型
│   └── session.ts        # セッション管理の型
├── utils/
│   └── thermal/          # 熱力学計算エンジン
│       ├── constants.ts  # 物理定数
│       ├── materials.ts  # 材質パラメータ
│       ├── methods.ts    # 冷却方法
│       └── calculator.ts # 計算関数
├── composables/          # Vueコンポーザブル
│   └── useThermalEngine.ts
├── stores/               # Piniaストア
├── pages/                # ページコンポーネント
├── components/           # UIコンポーネント
└── tests/                # テストコード
```

## 開発状況

### Phase 1-3: コア機能 ✅ 完了
- [x] Phase 0: ドキュメント・ルール整備
- [x] Phase 1: 熱力学計算エンジン (30テスト合格)
- [x] Phase 2: 基本UI実装（全画面完成）
- [x] Phase 3: ビジュアル強化（アニメーション、グラフ）

### Phase 4: 履歴・学習機能 ✅ 完了
- [x] IndexedDB履歴保存
- [x] 履歴モーダル表示
- [x] 統計表示（今日/今週/今月）

### Phase 5: PWA化 ✅ 完了
- [x] Service Worker実装
- [x] オフライン対応
- [x] ホーム画面追加対応
- [x] バイブレーション・通知

### パフォーマンス最適化 ✅ 完了
- [x] Lighthouse Performance: 99点
- [x] Lighthouse Accessibility: 94点
- [x] Core Web Vitals: 全て良好（FCP: 1.4s, LCP: 1.7s, TBT: 0ms）

### 本番デプロイ ✅ 完了
- [x] Vercelへデプロイ
- [x] 本番環境稼働中

## ライセンス

MIT

## 作者

開発: Claude Code + Human
