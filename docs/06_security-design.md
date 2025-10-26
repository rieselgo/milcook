# セキュリティ設計 - 粉ミルク調乳タイマー

## 脅威モデル

### 想定される脅威

#### 1. クライアントサイド攻撃
| 脅威 | リスクレベル | 影響 |
|------|--------------|------|
| XSS（クロスサイトスクリプティング） | 低 | ユーザーデータの漏洩、改ざん |
| CSRF（クロスサイトリクエストフォージェリ） | 低 | 不正な操作の実行 |
| ローカルストレージ改ざん | 低 | 設定データの破損 |

#### 2. データ保護
| 脅威 | リスクレベル | 影響 |
|------|--------------|------|
| 履歴データの漏洩 | 低 | プライバシー侵害（軽微） |
| 設定データの消失 | 中 | ユーザー体験の低下 |

#### 3. 将来の拡張（Firebase使用時）
| 脅威 | リスクレベル | 影響 |
|------|--------------|------|
| APIキーの漏洩 | 中 | 不正利用、コスト増加 |
| 認証の突破 | 高 | ユーザーデータの不正アクセス |
| Firestore不正アクセス | 高 | データの改ざん、削除 |

### リスク評価

**現状（Phase 1-3）**:
- ローカルストレージのみ使用
- 個人を特定できる情報なし
- **総合リスク: 低**

**将来（Phase 4-6、Firebase導入後）**:
- クラウド同期機能
- ユーザー認証
- **総合リスク: 中**

---

## セキュリティ対策

### 1. XSS対策

#### Vue.jsの自動エスケープ
```vue
<!-- ✅ 安全: Vue.jsが自動でエスケープ -->
<template>
  <div>{{ userInput }}</div>
</template>

<!-- ❌ 危険: v-htmlは使用禁止 -->
<template>
  <div v-html="userInput"></div> <!-- 絶対に使わない -->
</template>
```

#### サニタイゼーション（必要な場合のみ）
```typescript
import DOMPurify from 'dompurify';

// HTMLをサニタイズ（v-htmlを使う必要がある場合のみ）
const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty);
};
```

#### 入力値のバリデーション
```typescript
// utils/validation.ts
export const validateVolume = (volume: number): boolean => {
  return volume >= 100 && volume <= 240 && volume % 20 === 0;
};

export const validateTemperature = (temp: number): boolean => {
  return temp >= 36 && temp <= 40;
};

export const validateRoomTemp = (temp: number): boolean => {
  return temp >= 15 && temp <= 30;
};
```

---

### 2. Content Security Policy (CSP)

#### CSPヘッダー設定
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          'http-equiv': 'Content-Security-Policy',
          content: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com",
          ].join('; '),
        },
      ],
    },
  },
});
```

---

### 3. データ保護

#### IndexedDB暗号化（将来的に）
```typescript
import { AES, enc } from 'crypto-js';

// 暗号化
const encryptData = (data: string, key: string): string => {
  return AES.encrypt(data, key).toString();
};

// 復号化
const decryptData = (encrypted: string, key: string): string => {
  const bytes = AES.decrypt(encrypted, key);
  return bytes.toString(enc.Utf8);
};
```

**注意**: 現状はローカルのみなので暗号化不要。将来のクラウド同期時に検討。

#### データのバリデーション
```typescript
// 履歴データの保存前にバリデーション
const validateSession = (session: MilkSession): boolean => {
  if (!session.timestamp || !(session.timestamp instanceof Date)) {
    return false;
  }
  if (!validateVolume(session.volume)) {
    return false;
  }
  if (!validateTemperature(session.targetTemp)) {
    return false;
  }
  return true;
};

const saveSession = async (session: MilkSession): Promise<void> => {
  if (!validateSession(session)) {
    throw new Error('Invalid session data');
  }
  await db.sessions.add(session);
};
```

---

### 4. 環境変数管理

#### .env ファイル
```bash
# .env（Gitにコミットしない）
NUXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=milcook.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=milcook
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=milcook.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### .env.example（テンプレート）
```bash
# .env.example（Gitにコミット）
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### .gitignore
```
.env
.env.local
.env.*.local
```

#### 使用方法
```typescript
// plugins/firebase.client.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // 環境変数から取得
  const firebaseConfig = {
    apiKey: config.public.firebase.apiKey,
    authDomain: config.public.firebase.authDomain,
    projectId: config.public.firebase.projectId,
    storageBucket: config.public.firebase.storageBucket,
    messagingSenderId: config.public.firebase.messagingSenderId,
    appId: config.public.firebase.appId,
    measurementId: config.public.firebase.measurementId,
  };

  const app = initializeApp(firebaseConfig);

  return {
    provide: {
      firebase: app,
    },
  };
});
```

---

### 5. Firebase セキュリティルール（将来）

#### Firestore セキュリティルール
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 調乳セッション
    match /sessions/{sessionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.timestamp is timestamp &&
                       request.resource.data.volume >= 100 &&
                       request.resource.data.volume <= 240;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

#### Firebase Storage セキュリティルール
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // ユーザーは自分のファイルのみアクセス可能
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

### 6. 認証・認可（将来）

#### Firebase Authentication
```typescript
// composables/useAuth.ts
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

export const useAuth = () => {
  const { $firebase } = useNuxtApp();
  const auth = getAuth($firebase);
  const user = ref(auth.currentUser);

  // 認証状態の監視
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });

  // ログイン
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // サインアップ
  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  // ログアウト
  const logout = async () => {
    await signOut(auth);
  };

  return { user, login, signup, logout };
};
```

#### 認証ガード
```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth();

  if (!user.value && to.path !== '/login') {
    return navigateTo('/login');
  }
});
```

---

### 7. API レート制限（将来）

#### Cloud Functions でのレート制限
```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// レート制限: 1ユーザーあたり1時間に100リクエスト
const rateLimiter = new Map<string, number>();

export const saveSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const now = Date.now();
  const hourAgo = now - 3600000;

  // レート制限チェック
  const count = rateLimiter.get(userId) || 0;
  if (count > 100) {
    throw new functions.https.HttpsError('resource-exhausted', 'Too many requests');
  }

  // セッション保存
  await admin.firestore().collection('sessions').add({
    ...data,
    userId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // カウント更新
  rateLimiter.set(userId, count + 1);

  // 古いカウントをクリア
  setTimeout(() => {
    rateLimiter.delete(userId);
  }, 3600000);
});
```

---

### 8. ログとモニタリング

#### エラーログ
```typescript
// composables/useLogger.ts
export const useLogger = () => {
  const logError = (error: Error, context?: Record<string, any>) => {
    console.error('Error:', error.message, context);

    // 将来: Firebase Crashlytics や Sentry に送信
    // crashlytics().recordError(error);
  };

  const logInfo = (message: string, data?: Record<string, any>) => {
    console.log('Info:', message, data);
  };

  return { logError, logInfo };
};
```

#### セキュリティイベントのログ
```typescript
// 不正なログイン試行の記録
const logSecurityEvent = (event: string, details: Record<string, any>) => {
  console.warn('Security event:', event, details);

  // 将来: Cloud Logging に送信
};

// 使用例
logSecurityEvent('invalid_login_attempt', {
  email: 'user@example.com',
  timestamp: new Date(),
  ip: request.ip,
});
```

---

### 9. セキュリティチェックリスト

#### 開発時
- [ ] 環境変数に機密情報を格納
- [ ] .gitignore に .env を追加
- [ ] ユーザー入力をバリデーション
- [ ] XSS対策（v-html禁止）
- [ ] CSPヘッダー設定

#### デプロイ前
- [ ] Firebaseセキュリティルール設定
- [ ] API キーの制限設定（Firebase Console）
- [ ] HTTPS強制
- [ ] 環境変数の本番値設定

#### 定期的なメンテナンス
- [ ] 依存関係の脆弱性スキャン（`npm audit`）
- [ ] セキュリティパッチの適用
- [ ] アクセスログの確認

---

### 10. 依存関係の脆弱性管理

#### npm audit
```bash
# 脆弱性スキャン
npm audit

# 自動修正
npm audit fix

# 強制修正（破壊的変更を含む）
npm audit fix --force
```

#### Dependabot設定
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

---

## セキュリティインシデント対応

### インシデント発生時の手順

1. **検知**
   - エラーログの確認
   - ユーザーからの報告

2. **評価**
   - 影響範囲の特定
   - リスクレベルの判定

3. **対応**
   - 緊急パッチの適用
   - 脆弱性の修正

4. **通知**
   - ユーザーへの通知（必要な場合）
   - パスワードリセットの促進

5. **再発防止**
   - 原因分析
   - セキュリティ対策の強化

---

## まとめ

**現状（Phase 1-3）**:
- ローカルストレージのみ
- 機密情報なし
- XSS対策、CSP設定で十分

**将来（Phase 4-6）**:
- Firebase導入
- 認証機能追加
- Firestoreセキュリティルール設定
- API制限、ログ監視が必要

このセキュリティ設計により、ユーザーのデータを安全に保護します。
