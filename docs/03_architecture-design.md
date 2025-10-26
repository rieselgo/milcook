# アーキテクチャ設計 - みるくっく (シングルページアプリ)

## システム全体アーキテクチャ図

```
┌─────────────────────────────────────────────┐
│           User (Browser)                    │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│      みるくっく (Nuxt 3 SPA)                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         app.vue (エントリー)        │   │
│  │    状態によってコンポーネント切替    │   │
│  └─────────────────────────────────────┘   │
│                   │                         │
│      ┌────────────┼────────────┐           │
│      ↓            ↓             ↓           │
│  ┌────────┐  ┌────────┐  ┌──────────┐     │
│  │ Stores │  │Compo-  │  │Thermal   │     │
│  │ (Pinia)│  │nents   │  │Engine    │     │
│  └────────┘  └────────┘  └──────────┘     │
│      ↓                                      │
│  ┌─────────────────────────────────┐       │
│  │   LocalStorage / IndexedDB      │       │
│  └─────────────────────────────────┘       │
└─────────────────────────────────────────────┘
```

---

## アプリケーション構造

### シングルページアプリケーション

**コンセプト**: 1つのHTMLページで完結する軽量アプリ

```
app.vue (メインアプリ)
├─ components/              # UI部品
│  ├─ IdleScreen.vue        # 待機画面
│  ├─ PreparingScreen.vue   # 準備チェック
│  ├─ MixingScreen.vue      # 混合ガイド
│  ├─ CoolingScreen.vue     # タイマー実行
│  ├─ CompletedScreen.vue   # 完了画面
│  ├─ SettingsPanel.vue     # 設定(折りたたみ)
│  └─ HistorySummary.vue    # 履歴サマリー
│
├─ stores/                  # 状態管理
│  ├─ session.ts            # セッション(現在の調乳)
│  ├─ settings.ts           # ユーザー設定
│  └─ history.ts            # 履歴データ
│
├─ composables/             # ロジック
│  └─ useThermalEngine.ts   # 熱力学計算
│
├─ utils/                   # ユーティリティ
│  └─ thermal/              # 熱計算エンジン
│     ├─ constants.ts       # 物理定数
│     ├─ materials.ts       # 材質データ
│     ├─ methods.ts         # 冷却方法
│     └─ calculator.ts      # 計算関数
│
└─ types/                   # TypeScript型
   ├─ thermal.ts            # 熱計算の型
   └─ session.ts            # セッションの型
```

**pages/ ディレクトリは使用しない** ❌

---

## 状態管理アーキテクチャ

### Piniaストア

#### 1. Session Store (セッション管理)

```typescript
// stores/session.ts
{
  // 現在の状態
  status: 'idle' | 'preparing' | 'mixing' | 'cooling' | 'completed',

  // セッションデータ
  volume: 140,
  materialId: 'glass',
  coolingMethodId: 'ice_stir',
  targetTemp: 38,

  // 熱計算結果
  thermalResult: {
    hotWaterVolume: 108,
    coldWaterVolume: 32,
    initialMixTemp: 46.6,
    predictedCoolingTime: 87,
  },

  // 冷却中のデータ
  cooling: {
    startTime: Date | null,
    elapsedSeconds: 0,
    currentTemp: 46.6,
  },

  // UI状態
  ui: {
    showSettings: false,
  }
}
```

**主要アクション**:
- `startSession()` - 新しいセッションを開始
- `startCooling()` - 冷却開始
- `updateElapsedTime()` - 経過時間更新
- `completeSession()` - セッション完了
- `cancelSession()` - キャンセル

#### 2. Settings Store (設定管理)

```typescript
// stores/settings.ts
{
  defaultVolume: 140,
  defaultMaterialId: 'glass',
  defaultCoolingMethodId: 'ice_stir',
  defaultTargetTemp: 38,
  defaultColdWaterTemp: 20,
  defaultTargetMixTemp: 70,

  // UI設定
  nightMode: false,
  soundEnabled: true,
  vibrationEnabled: true,

  // アラート
  alertEnabled: true,
  alertBeforeMinutes: 1,
}
```

**永続化**: LocalStorageに自動保存

#### 3. History Store (履歴管理)

```typescript
// stores/history.ts
{
  sessions: MilkSession[], // 最大100件
}
```

**永続化**: LocalStorageに自動保存

---

## コンポーネント設計

### 状態別画面コンポーネント

各画面は独立したVueコンポーネント:

```vue
<!-- app.vue -->
<script setup>
const sessionStore = useSessionStore();
const status = computed(() => sessionStore.status);
</script>

<template>
  <div class="app">
    <Transition name="fade" mode="out-in">
      <IdleScreen v-if="status === 'idle'" />
      <PreparingScreen v-else-if="status === 'preparing'" />
      <MixingScreen v-else-if="status === 'mixing'" />
      <CoolingScreen v-else-if="status === 'cooling'" />
      <CompletedScreen v-else-if="status === 'completed'" />
    </Transition>
  </div>
</template>
```

### コンポーネント間の通信

- **Piniaストア経由**: コンポーネント間で状態を共有
- **Props/Emitsは不要**: すべてストアで管理
- **シンプルな依存関係**: 各コンポーネントはストアのみに依存

---

## 熱計算エンジン

### 設計原則

- **純粋関数**: 副作用なし
- **テスト可能**: 全関数に単体テスト
- **科学的正確性**: ニュートンの冷却法則に基づく

### 計算フロー

```
1. ユーザー入力
   ↓
2. calculateMilkPreparation()
   - お湯・湯冷まし量を計算
   - 混合後の温度を計算
   - 冷却定数を計算
   - 冷却時間を予測
   ↓
3. セッション開始
   ↓
4. 冷却中: 1秒ごとに
   - calculateCurrentTemp() で現在温度を計算
   - calculateRemainingTime() で残り時間を更新
   ↓
5. 目標温度到達
   ↓
6. セッション完了・履歴保存
```

### 主要関数

```typescript
// composables/useThermalEngine.ts

// 調乳全体の計算
calculateMilkPreparation(params)
  → { hotWaterVolume, coldWaterVolume, initialMixTemp, predictedCoolingTime }

// リアルタイム温度計算
calculateCurrentTemp(initialTemp, elapsedTime, ambientTemp, k)
  → 現在温度

// 残り時間計算
calculateRemainingTime(currentTemp, targetTemp, ambientTemp, k)
  → 残り時間(分)
```

---

## データフロー

### 1. 開始時

```
User Input (ミルク量、設定)
  ↓
Settings Store (デフォルト値取得)
  ↓
Thermal Engine (熱計算)
  ↓
Session Store (セッション作成)
  ↓
UI更新
```

### 2. 冷却中

```
タイマー (1秒ごと)
  ↓
Session Store (経過時間更新)
  ↓
Thermal Engine (温度計算)
  ↓
UI更新 (リアクティブ)
```

### 3. 完了時

```
目標温度到達
  ↓
Session Store (セッション完了)
  ↓
History Store (履歴保存)
  ↓
LocalStorage (永続化)
  ↓
UI更新 (完了画面)
```

---

## ストレージ戦略

### LocalStorage

**用途**: 軽量データの永続化

```javascript
// 保存するデータ
localStorage.setItem('milcook_settings', JSON.stringify(settings));
localStorage.setItem('milcook_history', JSON.stringify(sessions));
```

**容量**: ~5MB (十分)

### IndexedDB (将来)

大量の履歴データが必要になった場合:
- Dexie.jsを使用
- 1000件以上の履歴
- 統計データのキャッシュ

---

## パフォーマンス最適化

### 1. リアクティビティ

```typescript
// computed で自動更新
const currentTemp = computed(() => {
  return calculateCurrentTemp(
    initialTemp,
    elapsedMinutes,
    ambientTemp,
    coolingConstant
  );
});
```

### 2. タイマーの最適化

```typescript
// setIntervalではなくrequestAnimationFrameを検討
let animationId: number;

const updateTimer = () => {
  elapsedSeconds.value++;
  animationId = requestAnimationFrame(updateTimer);
};
```

### 3. メモリ管理

- コンポーネントのアンマウント時にタイマーをクリア
- 不要な履歴データは削除(最大100件)

---

## セキュリティ

### クライアントサイドのみ

- サーバー不要 → セキュリティリスク低
- ユーザーデータは端末内のみ
- 外部API呼び出しなし

### データ保護

- LocalStorageは同一オリジンのみアクセス可
- センシティブな情報なし(ミルク量、時刻のみ)

---

## テスト戦略

### 1. 単体テスト (Vitest)

```
utils/thermal/*.ts         → 30テスト (完了)
stores/*.ts                → 各ストアのアクション
composables/*.ts           → ロジック
```

### 2. コンポーネントテスト

```
components/*.vue           → UIの動作確認
```

### 3. E2Eテスト (Playwright)

```
完全な調乳フロー           → 待機→準備→混合→冷却→完了
設定の永続化               → 設定→リロード→確認
履歴の保存                 → セッション完了→履歴確認
```

---

## デプロイメント

### 静的ホスティング

Nuxt 3のSSG(静的生成)機能を使用:

```bash
npm run generate
```

→ `.output/public/` に静的ファイル生成

### ホスティング先

- Vercel (推奨)
- Netlify
- Firebase Hosting
- GitHub Pages

**すべて無料枠で運用可能**

---

## 拡張性

### フェーズ2以降の追加機能

現在のアーキテクチャで対応可能:

1. **PWA化**: Service Workerを追加
2. **通知**: Web Notification API
3. **音声**: Web Audio API
4. **データ同期**: Firebase (オプション)
5. **統計グラフ**: Chart.js (既にインストール済み)

### 変更不要

- **コアロジック**: 熱計算エンジンはそのまま
- **ストア**: 拡張可能な設計
- **コンポーネント**: 独立して追加可能

---

## まとめ

### アーキテクチャの特徴

✅ **シンプル**: 1つのapp.vueで完結
✅ **高速**: ページ遷移なし
✅ **テスト可能**: 純粋関数ベース
✅ **拡張可能**: モジュール構造
✅ **メンテナブル**: 明確な責務分離

### 技術選択の理由

| 技術 | 理由 |
|------|------|
| Nuxt 3 | Vue3 + 最新機能 + SSG |
| Pinia | シンプルな状態管理 |
| TypeScript | 型安全性 |
| Vitest | 高速テスト |
| LocalStorage | 永続化(シンプル) |

このアーキテクチャにより、**シンプルで高速、メンテナンスしやすいアプリ**を実現します。
