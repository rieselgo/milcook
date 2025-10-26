# みるくっく (milcook)

科学的根拠に基づいた粉ミルク調乳タイマーアプリ

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

- [x] Phase 0: ドキュメント・ルール整備
- [x] Phase 1 Step 1: プロジェクト初期化
- [x] Phase 1 Step 2: 熱力学計算エンジン (30テスト合格)
- [ ] Phase 1 Step 3: 基本UI実装
- [ ] Phase 1 Step 4: ミルク調乳ガイド
- [ ] Phase 1 Step 5: タイマー実行画面
- [ ] Phase 1 Step 6: 温度アラート機能

## ライセンス

MIT

## 作者

開発: Claude Code + Human
