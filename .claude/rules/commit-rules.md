# コミットルール - 粉ミルク調乳タイマー

## コミットメッセージフォーマット

### 基本構造

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 例
```
feat(timer): 氷水攪拌モードの揺らしリマインダーを実装

15秒ごとにバイブレーションで通知する機能を追加。
揺らしカウンターとタイマーUIも実装。

Closes #12
```

---

## Type一覧

### 主要なType

| Type | 説明 | 例 |
|------|------|-----|
| `feat` | 新機能の追加 | `feat(timer): タイマー実行画面を実装` |
| `fix` | バグ修正 | `fix(thermal): 温度計算の小数点誤差を修正` |
| `docs` | ドキュメントのみの変更 | `docs(readme): セットアップ手順を追加` |
| `style` | コードフォーマット、セミコロン等 | `style(components): ESLint警告を解消` |
| `refactor` | リファクタリング | `refactor(composables): useTimer を分割` |
| `test` | テスト追加・修正 | `test(thermal): 熱力学計算のテストを追加` |
| `chore` | ビルド・設定変更 | `chore(deps): Nuxt 3.13.1 にアップデート` |
| `perf` | パフォーマンス改善 | `perf(timer): 温度計算のメモ化を追加` |

### 使用例

```bash
# ✅ Good: 新機能
feat(bottle): 哺乳瓶ビジュアルコンポーネントを実装

# ✅ Good: バグ修正
fix(timer): タイマー停止時のメモリリークを修正

# ✅ Good: ドキュメント
docs(architecture): アーキテクチャ設計図を追加

# ✅ Good: スタイル
style(timer): インデントを2スペースに統一

# ✅ Good: リファクタリング
refactor(utils): 色補間関数を共通化

# ✅ Good: テスト
test(thermal): エッジケースのテストを追加

# ✅ Good: ビルド・設定
chore(firebase): Firebase Hosting設定を追加

# ❌ Bad: typeが不明確
update(timer): いろいろ修正
```

---

## Scope（スコープ）

機能・ファイル・モジュール単位で指定

### 推奨スコープ一覧

```
timer          - タイマー機能全般
bottle         - 哺乳瓶ビジュアル
thermal        - 熱力学エンジン
settings       - 設定画面
history        - 履歴機能
ui             - 共通UIコンポーネント
pwa            - PWA関連
deps           - 依存関係
config         - 設定ファイル
```

### 例
```bash
feat(timer): タイマー実行画面を実装
fix(thermal): 冷却定数の計算ミスを修正
docs(architecture): コンポーネント依存関係図を追加
chore(deps): Chart.js を追加
```

---

## Subject（件名）

### ルール
- **50文字以内**を推奨
- 命令形で記述（「〜を実装」「〜を修正」）
- 文末にピリオド不要
- 日本語でOK

### ✅ Good
```
feat(timer): 温度グラフコンポーネントを実装
fix(bottle): SVGグラデーションの色補間を修正
refactor(composables): useThermalEngineを分割
```

### ❌ Bad
```
feat(timer): タイマーいろいろ追加した  # 曖昧
fix: バグ直した                       # スコープなし、抽象的
update(timer): timer.vueを更新        # 何をしたか不明
```

---

## Body（本文）

### 記述内容
- **何を変更したか**（What）
- **なぜ変更したか**（Why）
- 影響範囲や注意点

### 例
```
feat(thermal): 熱伝達係数の流速依存性を実装

対流熱伝達係数が流速の平方根に比例することを考慮。
これにより氷水攪拌と静置の冷却速度の違いを正確にモデル化。

影響: calculateTemperature関数のシグネチャが変更
```

### ✅ Good: 詳細な説明
```
fix(timer): タイマー停止時のメモリリークを修正

setInterval のクリアを useEffect のクリーンアップで実行するように変更。
以前はコンポーネントアンマウント時にインターバルが残留していた。

テスト: Chrome DevTools でメモリプロファイルを確認
```

### ❌ Bad: 本文なし（必要な場合）
```
feat(thermal): 熱伝達係数の計算を変更

（本文なし、なぜ変更したかが不明）
```

---

## Footer（フッター）

### Issue参照
- `Closes #123` - Issueをクローズ
- `Refs #123` - Issue参照のみ
- `Fixes #123` - バグ修正でIssueクローズ

### Breaking Changes
- 互換性を破壊する変更は `BREAKING CHANGE:` で明記

```
feat(thermal): calculateTemperature の引数を変更

BREAKING CHANGE: 第3引数に CoolingMethod オブジェクトを渡すように変更。
以前の文字列指定は非推奨。

Before: calculateTemperature(46.6, 0.88, 'ice_stir')
After: calculateTemperature(46.6, 0.88, iceStirMethod)
```

---

## コミットのサイズ

### 原則
- **1コミット = 1つの論理的変更**
- 大きすぎる変更は分割
- 無関係な変更は別コミットに

### ✅ Good: 適切なサイズ
```bash
# 機能ごとに分割
git commit -m "feat(bottle): BottleVisual コンポーネントを実装"
git commit -m "feat(bottle): 温度に応じた色変化を追加"
git commit -m "test(bottle): BottleVisual のテストを追加"
```

### ❌ Bad: 大きすぎる
```bash
# 複数の機能を1つにまとめている
git commit -m "feat: タイマー、哺乳瓶、グラフ、履歴を実装"
```

### ❌ Bad: 小さすぎる
```bash
# 同じファイルの修正を細かく分割しすぎ
git commit -m "fix: スペース追加"
git commit -m "fix: インデント修正"
git commit -m "fix: セミコロン追加"
```

---

## コミット前チェックリスト

### 必須チェック項目

- [ ] **Lintエラーがないか**
  ```bash
  pnpm lint
  ```

- [ ] **テストが通るか**
  ```bash
  pnpm test
  ```

- [ ] **型エラーがないか**
  ```bash
  pnpm nuxi typecheck
  ```

- [ ] **不要な console.log がないか**
  - デバッグ用のログは削除
  - 必要な場合は適切なロガーを使用

- [ ] **不要なファイルが含まれていないか**
  - `.env` ファイル
  - `node_modules`
  - IDE設定ファイル
  - テスト用の一時ファイル

- [ ] **機密情報がハードコードされていないか**
  - APIキー
  - トークン
  - パスワード

---

## ブランチ命名規則

### 推奨フォーマット
```
<type>/<issue-number>-<short-description>
```

### 例
```bash
feat/12-shake-reminder        # 新機能
fix/34-memory-leak            # バグ修正
refactor/56-thermal-engine    # リファクタリング
docs/78-architecture-design   # ドキュメント
```

### ✅ Good
```
feat/timer-execution
fix/temperature-calculation
refactor/use-thermal-engine
```

### ❌ Bad
```
feature1             # 内容が不明
fix-bug              # 何のバグか不明
serizawa/work        # 個人名のブランチ
```

---

## Pull Request（PR）のコミット

### PRマージ時の推奨方法
- **Squash Merge**: 小さな修正コミットをまとめる
- **Merge Commit**: 大きな機能追加
- **Rebase**: 履歴を線形に保ちたい場合

### PR時のコミットメッセージ
```
feat(timer): タイマー実行画面を実装（#12）

以下の機能を実装:
- リアルタイム温度計算
- 進捗バー表示
- 揺らしリマインダー
- 一時停止/再開/終了ボタン

テスト:
- ユニットテスト追加
- E2Eテストで画面遷移を確認

スクリーンショット:
[添付画像]
```

---

## 参考: Conventional Commits

このプロジェクトは [Conventional Commits](https://www.conventionalcommits.org/) に準拠しています。

---

このルールに従うことで、以下のメリットがあります：
- コミット履歴が読みやすい
- 自動的に CHANGELOG 生成可能
- リリースノート作成が容易
- コードレビューが効率的
