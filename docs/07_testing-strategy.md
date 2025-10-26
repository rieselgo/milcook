# テスト戦略 - 粉ミルク調乳タイマー

## テスト方針

### 目標
- **高品質**: バグを最小限に抑え、安定した動作を保証
- **信頼性**: 熱力学計算の正確性を担保
- **保守性**: リファクタリング時の安全性確保
- **自動化**: CI/CDでの自動テスト実行

### テストピラミッド

```
        ┌──────────┐
        │   E2E    │  少数（クリティカルパスのみ）
        │  Tests   │
        ├──────────┤
        │Integration│  中程度（Composables）
        │   Tests   │
        ├──────────┤
        │   Unit    │  多数（Utils、計算ロジック）
        │   Tests   │
        └──────────┘
```

---

## ユニットテスト

### 対象
- `utils/` 配下の純粋関数
- 熱力学計算エンジン
- バリデーション関数
- フォーマット関数

### ツール
- **Vitest**: 高速なユニットテストランナー
- **@vue/test-utils**: Vueコンポーネントのテスト

### カバレッジ目標
- **全体**: 80%以上
- **熱力学計算**: 95%以上（重要度が高いため）
- **ユーティリティ関数**: 90%以上

---

### 熱力学計算のテスト

#### `utils/thermal/calculator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateNewtonCooling,
  calculateCoolingConstant,
  calculateTimeToTarget,
} from './calculator';
import { MATERIALS } from './materials';
import { COOLING_METHODS } from './methods';

describe('calculateNewtonCooling', () => {
  it('経過時間0では初期温度を返す', () => {
    const result = calculateNewtonCooling(46.6, 0, 2, 0.2401);
    expect(result).toBe(46.6);
  });

  it('十分な時間経過で周囲温度に近づく', () => {
    const result = calculateNewtonCooling(46.6, 100, 2, 0.2401);
    expect(result).toBeCloseTo(2, 0);
  });

  it('氷水攪拌で約53秒後に38°Cになる（ガラス瓶140ml）', () => {
    const k = 0.2401; // 実測値からの冷却定数
    const result = calculateNewtonCooling(46.6, 0.88, 2, k);
    expect(result).toBeCloseTo(38, 1);
  });

  it('周囲温度が初期温度より高い場合、加熱される', () => {
    const result = calculateNewtonCooling(20, 1, 40, 0.1);
    expect(result).toBeGreaterThan(20);
    expect(result).toBeLessThan(40);
  });
});

describe('calculateCoolingConstant', () => {
  it('ガラス瓶140ml氷水攪拌の冷却定数を計算', () => {
    const k = calculateCoolingConstant(
      140,
      MATERIALS.glass,
      COOLING_METHODS.ice_stir
    );
    expect(k).toBeGreaterThan(0);
    expect(k).toBeCloseTo(0.24, 1); // 約0.24 (1/分)
  });

  it('プラスチックはガラスより冷却が遅い', () => {
    const kGlass = calculateCoolingConstant(140, MATERIALS.glass, COOLING_METHODS.ice_stir);
    const kPlastic = calculateCoolingConstant(140, MATERIALS.plastic, COOLING_METHODS.ice_stir);
    expect(kPlastic).toBeLessThan(kGlass);
  });

  it('氷水静置は氷水攪拌より冷却が遅い', () => {
    const kStir = calculateCoolingConstant(140, MATERIALS.glass, COOLING_METHODS.ice_stir);
    const kStill = calculateCoolingConstant(140, MATERIALS.glass, COOLING_METHODS.ice_still);
    expect(kStill).toBeLessThan(kStir);
  });

  it('ミルク量が多いほど冷却が遅い', () => {
    const k100 = calculateCoolingConstant(100, MATERIALS.glass, COOLING_METHODS.ice_stir);
    const k240 = calculateCoolingConstant(240, MATERIALS.glass, COOLING_METHODS.ice_stir);
    expect(k240).toBeLessThan(k100);
  });
});

describe('calculateTimeToTarget', () => {
  it('目標温度到達時間を正しく計算', () => {
    const time = calculateTimeToTarget(46.6, 38, 2, 0.2401);
    expect(time).toBeCloseTo(0.88, 1); // 約0.88分（53秒）
  });

  it('初期温度が目標温度と同じ場合、0を返す', () => {
    const time = calculateTimeToTarget(38, 38, 2, 0.2401);
    expect(time).toBe(0);
  });

  it('初期温度が目標温度より低い場合、0を返す', () => {
    const time = calculateTimeToTarget(36, 38, 2, 0.2401);
    expect(time).toBe(0);
  });

  it('目標温度が周囲温度以下の場合、Infinityを返す', () => {
    const time = calculateTimeToTarget(46.6, 1, 2, 0.2401);
    expect(time).toBe(Infinity);
  });
});
```

---

### バリデーションのテスト

#### `utils/validation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  validateVolume,
  validateTemperature,
  validateRoomTemp,
  validateSession,
} from './validation';

describe('validateVolume', () => {
  it('有効な値を許可', () => {
    expect(validateVolume(100)).toBe(true);
    expect(validateVolume(120)).toBe(true);
    expect(validateVolume(140)).toBe(true);
    expect(validateVolume(240)).toBe(true);
  });

  it('範囲外の値を拒否', () => {
    expect(validateVolume(50)).toBe(false);
    expect(validateVolume(300)).toBe(false);
  });

  it('20ml単位でない値を拒否', () => {
    expect(validateVolume(130)).toBe(false);
    expect(validateVolume(145)).toBe(false);
  });
});

describe('validateTemperature', () => {
  it('有効な温度を許可', () => {
    expect(validateTemperature(36)).toBe(true);
    expect(validateTemperature(38)).toBe(true);
    expect(validateTemperature(40)).toBe(true);
  });

  it('範囲外の温度を拒否', () => {
    expect(validateTemperature(35)).toBe(false);
    expect(validateTemperature(41)).toBe(false);
  });
});

describe('validateSession', () => {
  it('有効なセッションを許可', () => {
    const session = {
      timestamp: new Date(),
      volume: 140,
      bottleMaterialId: 'glass',
      coolingMethodId: 'ice_stir',
      targetTemp: 38,
      initialTemp: 46.6,
      predictedTime: 53,
      completed: true,
    };
    expect(validateSession(session)).toBe(true);
  });

  it('不正なボリュームを拒否', () => {
    const session = {
      timestamp: new Date(),
      volume: 50,
      bottleMaterialId: 'glass',
      coolingMethodId: 'ice_stir',
      targetTemp: 38,
      initialTemp: 46.6,
      predictedTime: 53,
      completed: true,
    };
    expect(validateSession(session)).toBe(false);
  });
});
```

---

### フォーマット関数のテスト

#### `utils/format.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatTime, formatTemperature, formatDate } from './format';

describe('formatTime', () => {
  it('秒を mm:ss 形式でフォーマット', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(30)).toBe('0:30');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(125)).toBe('2:05');
  });
});

describe('formatTemperature', () => {
  it('温度を小数点1桁でフォーマット', () => {
    expect(formatTemperature(38.5)).toBe('38.5°C');
    expect(formatTemperature(46.67)).toBe('46.7°C');
  });
});

describe('formatDate', () => {
  it('日時をフォーマット', () => {
    const date = new Date('2025-10-26T14:30:00');
    expect(formatDate(date)).toBe('2025/10/26 14:30');
  });
});
```

---

## インテグレーションテスト

### 対象
- Composables（useThermalEngine, useTimer, useHistory）
- Store（Pinia）
- コンポーネント間の連携

### ツール
- **Vitest**
- **@pinia/testing**: Pinia のテストユーティリティ

---

### Composablesのテスト

#### `composables/useThermalEngine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { useThermalEngine } from './useThermalEngine';
import { MATERIALS } from '~/utils/thermal/materials';
import { COOLING_METHODS } from '~/utils/thermal/methods';

describe('useThermalEngine', () => {
  it('温度を正しく計算', () => {
    const { calculateTemperature } = useThermalEngine();

    const result = calculateTemperature({
      initialTemp: 46.6,
      elapsedTime: 0.88,
      volume: 140,
      material: MATERIALS.glass,
      method: COOLING_METHODS.ice_stir,
    });

    expect(result).toBeCloseTo(38, 1);
  });

  it('冷却時間を正しく予測', () => {
    const { predictCoolingTime } = useThermalEngine();

    const result = predictCoolingTime({
      initialTemp: 46.6,
      targetTemp: 38,
      volume: 140,
      material: MATERIALS.glass,
      method: COOLING_METHODS.ice_stir,
    });

    expect(result).toBeCloseTo(0.88, 0.1); // 約0.88分
  });
});
```

#### `composables/useTimer.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTimer } from './useTimer';
import { useTimerStore } from '~/stores/timer';
import { setActivePinia, createPinia } from 'pinia';

describe('useTimer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('タイマーを開始できる', () => {
    const { start } = useTimer();
    const store = useTimerStore();

    start();

    expect(store.isRunning).toBe(true);
  });

  it('タイマーを一時停止できる', () => {
    const { start, pause } = useTimer();
    const store = useTimerStore();

    start();
    pause();

    expect(store.isRunning).toBe(false);
  });

  it('1秒ごとに経過時間が増加する', () => {
    const { start } = useTimer();
    const store = useTimerStore();

    start();

    vi.advanceTimersByTime(1000);
    expect(store.elapsedTime).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(store.elapsedTime).toBe(2);
  });
});
```

---

### Storeのテスト

#### `stores/settings.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSettingsStore } from './settings';

describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('デフォルト値が設定されている', () => {
    const store = useSettingsStore();

    expect(store.volume).toBe(140);
    expect(store.bottleMaterialId).toBe('glass');
    expect(store.targetTemp).toBe(38);
  });

  it('ボリュームを更新できる', () => {
    const store = useSettingsStore();

    store.updateVolume(200);

    expect(store.volume).toBe(200);
  });

  it('材質を変更できる', () => {
    const store = useSettingsStore();

    store.bottleMaterialId = 'plastic';

    expect(store.bottleMaterialId).toBe('plastic');
    expect(store.material.id).toBe('plastic');
  });
});
```

---

## コンポーネントテスト

### 対象
- 重要なUIコンポーネント
- ユーザー操作のテスト

### ツール
- **@vue/test-utils**
- **Vitest**

---

### コンポーネントのテスト例

#### `components/atoms/Button.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
  it('ラベルを表示', () => {
    const wrapper = mount(Button, {
      slots: {
        default: '開始',
      },
    });

    expect(wrapper.text()).toBe('開始');
  });

  it('クリックイベントを発火', async () => {
    const wrapper = mount(Button);

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('disabled 時はクリックできない', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true,
      },
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
  });
});
```

---

## E2Eテスト

### 対象
- クリティカルパス（調乳フロー全体）
- ユーザージャーニー

### ツール
- **Playwright**: クロスブラウザE2Eテスト

### カバレッジ目標
- **ハッピーパス**: 100%
- **エラーパス**: 主要なもののみ

---

### E2Eテスト例

#### `tests/e2e/milk-timer-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('調乳フロー全体', async ({ page }) => {
  // ホーム画面
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('調乳タイマー');

  // 新しく調乳する
  await page.click('text=調乳を始める');
  await expect(page).toHaveURL('/prepare');

  // 準備チェックリスト
  await page.click('text=準備完了');
  await expect(page).toHaveURL('/guide');

  // 調乳ガイド Step1
  await expect(page.locator('text=85°Cのお湯')).toBeVisible();
  await page.click('text=完了 → 次へ');

  // 調乳ガイド Step2
  await expect(page.locator('text=湯冷まし')).toBeVisible();
  await page.click('text=完了 → 冷却方法を選ぶ');

  // 冷却方法選択
  await expect(page).toHaveURL('/cooling');
  await page.click('text=氷水攪拌');

  // タイマー実行
  await expect(page).toHaveURL('/timer');
  await expect(page.locator('text=経過時間')).toBeVisible();
  await expect(page.locator('text=°C')).toBeVisible();

  // タイマー一時停止
  await page.click('text=一時停止');
  // タイマーが停止することを確認
});

test('設定変更', async ({ page }) => {
  await page.goto('/');

  // 設定画面へ
  await page.click('text=設定');
  await expect(page).toHaveURL('/settings');

  // ミルク量を変更
  await page.click('text=200ml');

  // 材質を変更
  await page.click('text=プラスチック');

  // 保存
  await page.click('text=保存して戻る');
  await expect(page).toHaveURL('/');
});
```

---

## モック戦略

### IndexedDBのモック

```typescript
// tests/mocks/dexie.ts
import { vi } from 'vitest';

export const mockDb = {
  sessions: {
    add: vi.fn(),
    toArray: vi.fn(),
    orderBy: vi.fn(() => ({
      reverse: vi.fn(() => ({
        limit: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
};

vi.mock('~/plugins/dexie.client', () => ({
  db: mockDb,
}));
```

### Vibration APIのモック

```typescript
// tests/mocks/vibration.ts
import { vi } from 'vitest';

vi.stubGlobal('navigator', {
  vibrate: vi.fn(),
});
```

---

## CI/CD統合

### GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## テスト実行コマンド

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

このテスト戦略により、高品質で信頼性の高いアプリケーションを実現します。
