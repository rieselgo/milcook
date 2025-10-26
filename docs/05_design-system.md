# デザインシステム - 粉ミルク調乳タイマー

## デザインコンセプト

**「夜中でも見やすい、片手で操作できる、迷わない、温度変化が直感的」**

### デザイン原則
1. **視認性**: 暗い部屋でも見やすい配色とコントラスト
2. **操作性**: 片手で届く範囲にボタン配置
3. **直感性**: 説明なしで理解できるUI
4. **温度表現**: 色で温度を直感的に伝える
5. **安心感**: 柔らかく優しいデザイン

---

## カラーパレット

### 温度表現カラー

#### ホットスケール（温度に応じた色）
```css
/* 50°C以上 - 濃いオレンジ */
--temp-hot: #FF6B35;
--temp-hot-rgb: 255, 107, 53;

/* 45-50°C - オレンジ */
--temp-warm: #FF8C42;
--temp-warm-rgb: 255, 140, 66;

/* 40-45°C - 薄いオレンジ */
--temp-medium: #FFB84D;
--temp-medium-rgb: 255, 184, 77;

/* 38-40°C - イエロー */
--temp-cool: #FFF066;
--temp-cool-rgb: 255, 240, 102;

/* 38°C以下 - グリーン（適温） */
--temp-cold: #4CAF50;
--temp-cold-rgb: 76, 175, 80;
```

#### プライマリカラー（冷却を連想するブルー系）
```css
/* メインカラー */
--primary-50: #E3F2FD;
--primary-100: #BBDEFB;
--primary-200: #90CAF9;
--primary-300: #64B5F6;
--primary-400: #42A5F5;
--primary-500: #2196F3; /* Primary */
--primary-600: #1E88E5;
--primary-700: #1976D2;
--primary-800: #1565C0;
--primary-900: #0D47A1;
```

#### セカンダリカラー（温かみのあるピンク系）
```css
--secondary-50: #FCE4EC;
--secondary-100: #F8BBD0;
--secondary-200: #F48FB1;
--secondary-300: #F06292;
--secondary-400: #EC407A;
--secondary-500: #E91E63; /* Secondary */
--secondary-600: #D81B60;
--secondary-700: #C2185B;
--secondary-800: #AD1457;
--secondary-900: #880E4F;
```

#### グレースケール
```css
--gray-50: #FAFAFA;
--gray-100: #F5F5F5;
--gray-200: #EEEEEE;
--gray-300: #E0E0E0;
--gray-400: #BDBDBD;
--gray-500: #9E9E9E;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;
```

#### セマンティックカラー
```css
/* 成功 */
--success: #4CAF50;
--success-light: #81C784;
--success-dark: #388E3C;

/* 警告 */
--warning: #FF9800;
--warning-light: #FFB74D;
--warning-dark: #F57C00;

/* エラー */
--error: #F44336;
--error-light: #E57373;
--error-dark: #D32F2F;

/* 情報 */
--info: #2196F3;
--info-light: #64B5F6;
--info-dark: #1976D2;
```

### ダークモードカラー

```css
/* ダークモード */
--dark-bg: #121212;
--dark-bg-elevated: #1E1E1E;
--dark-bg-card: #2C2C2C;
--dark-text-primary: #FFFFFF;
--dark-text-secondary: #B3B3B3;
--dark-text-disabled: #666666;
```

---

## タイポグラフィ

### フォントファミリー

```css
/* プライマリフォント（日本語） */
--font-family-primary: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', sans-serif;

/* 数値表示用（等幅） */
--font-family-mono: 'Roboto Mono', 'SF Mono', 'Consolas', 'Monaco', monospace;
```

### フォントサイズ

```css
/* 見出し */
--text-10xl: 10rem;   /* 160px - 超大型（温度表示） */
--text-9xl: 8rem;     /* 128px */
--text-8xl: 6rem;     /* 96px */
--text-7xl: 4.5rem;   /* 72px */
--text-6xl: 3.75rem;  /* 60px */
--text-5xl: 3rem;     /* 48px */
--text-4xl: 2.25rem;  /* 36px */
--text-3xl: 1.875rem; /* 30px */
--text-2xl: 1.5rem;   /* 24px */
--text-xl: 1.25rem;   /* 20px */

/* 本文 */
--text-lg: 1.125rem;  /* 18px */
--text-base: 1rem;    /* 16px */
--text-sm: 0.875rem;  /* 14px */
--text-xs: 0.75rem;   /* 12px */
```

### フォントウェイト

```css
--font-thin: 100;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

### 行の高さ

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

---

## スペーシング

### 基本単位（4px grid system）

```css
--spacing-0: 0;
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */
--spacing-20: 5rem;    /* 80px */
--spacing-24: 6rem;    /* 96px */
```

---

## ボーダー

### ボーダー幅

```css
--border-0: 0;
--border-1: 1px;
--border-2: 2px;
--border-4: 4px;
--border-8: 8px;
```

### ボーダー半径

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* 完全な円 */
```

---

## シャドウ

```css
/* ライトモード */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* ダークモード */
--shadow-dark-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-dark-base: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
--shadow-dark-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
--shadow-dark-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.6);
```

---

## コンポーネントライブラリ

### Button（ボタン）

#### Variant（バリエーション）

```vue
<!-- Primary Button -->
<button class="btn btn-primary">
  開始
</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">
  設定
</button>

<!-- Outline Button -->
<button class="btn btn-outline">
  戻る
</button>

<!-- Danger Button -->
<button class="btn btn-danger">
  終了
</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">
  キャンセル
</button>
```

#### Size（サイズ）

```vue
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-md">Medium</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>
```

#### スタイル定義

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  border-radius: var(--radius-xl);
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  outline: none;
}

/* Primary */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-base);
}

/* サイズ */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: var(--text-sm);
}

.btn-md {
  padding: 0.75rem 1.5rem;
  font-size: var(--text-base);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: var(--text-lg);
}

.btn-xl {
  padding: 1.5rem 3rem;
  font-size: var(--text-xl);
}
```

### Card（カード）

```vue
<div class="card">
  <div class="card-header">
    <h3>タイトル</h3>
  </div>
  <div class="card-body">
    <p>コンテンツ</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">アクション</button>
  </div>
</div>
```

```css
.card {
  background: white;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}
```

### Input（入力フィールド）

```vue
<div class="input-group">
  <label for="volume">ミルク量</label>
  <input
    id="volume"
    v-model="volume"
    type="number"
    class="input"
    placeholder="140"
  />
</div>
```

```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}
```

### Slider（スライダー）

```vue
<div class="slider-group">
  <label>目標温度: {{ targetTemp }}°C</label>
  <input
    v-model.number="targetTemp"
    type="range"
    min="36"
    max="40"
    step="1"
    class="slider"
  />
</div>
```

```css
.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--gray-200);
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.slider::-webkit-slider-thumb:hover {
  background: var(--primary-600);
  box-shadow: var(--shadow-lg);
}
```

### Badge（バッジ）

```vue
<span class="badge badge-success">おすすめ</span>
<span class="badge badge-warning">注意</span>
<span class="badge badge-error">エラー</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.badge-success {
  background: var(--success-light);
  color: var(--success-dark);
}

.badge-warning {
  background: var(--warning-light);
  color: var(--warning-dark);
}

.badge-error {
  background: var(--error-light);
  color: var(--error-dark);
}
```

---

## アイコン

### Nuxt Icon（Iconify経由）

```vue
<!-- 使用例 -->
<Icon name="mdi:bottle-wine" size="24" />
<Icon name="mdi:thermometer" size="32" />
<Icon name="mdi:alarm" size="20" />
<Icon name="mdi:history" size="24" />
<Icon name="mdi:cog" size="24" />
```

### アイコンセット
- **Material Design Icons** (`mdi:*`)
- **Heroicons** (`heroicons:*`)
- **Lucide** (`lucide:*`)

### よく使うアイコン
```
mdi:bottle-wine         - 哺乳瓶
mdi:thermometer         - 温度
mdi:alarm               - タイマー
mdi:pause               - 一時停止
mdi:play                - 再生
mdi:stop                - 停止
mdi:history             - 履歴
mdi:cog                 - 設定
mdi:check-circle        - チェック
mdi:alert-circle        - アラート
mdi:information         - 情報
mdi:hand-wave           - 揺らし
```

---

## アニメーション

### トランジション

```css
/* 基本トランジション */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
--transition-slower: 500ms ease;

/* イージング */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### アニメーション例

#### フェードイン
```vue
<Transition name="fade">
  <div v-if="show">コンテンツ</div>
</Transition>
```

```css
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
```

#### スライドアップ
```vue
<Transition name="slide-up">
  <div v-if="show">コンテンツ</div>
</Transition>
```

```css
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--transition-base);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
```

#### 温度変化アニメーション
```vue
<div
  class="temperature-display"
  :style="{ color: getTempColor(currentTemp) }"
>
  {{ currentTemp.toFixed(1) }}°C
</div>
```

```css
.temperature-display {
  font-size: var(--text-10xl);
  font-weight: var(--font-bold);
  transition: color var(--transition-slow);
}
```

---

## レスポンシブデザイン

### ブレークポイント

```css
/* モバイルファースト */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
```

### メディアクエリ

```css
/* モバイル（デフォルト） */
.container {
  padding: 1rem;
}

/* タブレット */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 640px;
    margin: 0 auto;
  }
}

/* デスクトップ */
@media (min-width: 1024px) {
  .container {
    max-width: 768px;
  }
}
```

---

## アクセシビリティ

### カラーコントラスト比

- **通常テキスト**: 4.5:1以上
- **大きなテキスト**: 3:1以上

### フォーカススタイル

```css
button:focus,
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
}
```

### タッチターゲットサイズ

最小サイズ: **44x44px**（Appleガイドライン）

```css
.btn {
  min-width: 44px;
  min-height: 44px;
}
```

---

このデザインシステムにより、一貫性のある美しいUIを実現します。
