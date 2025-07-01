# Next.js v15 包括的ベストプラクティスガイド

## 目次

1. [概要](#概要)
2. [Next.js v15 の新機能と破壊的変更](#nextjs-v15の新機能と破壊的変更)
3. [コードレビュー用ガイドライン](#コードレビュー用ガイドライン)
4. [新規開発支援ガイド](#新規開発支援ガイド)
5. [既存プロジェクト改善ガイド](#既存プロジェクト改善ガイド)
6. [共通ベストプラクティス](#共通ベストプラクティス)
7. [アンチパターン集](#アンチパターン集)

---

## 概要

Next.js v15 は、React 19 サポート、Turbopack 安定化、キャッシング戦略の大幅見直しにより、開発体験を根本的に改善しています。本ガイドは、AI によるコードレビュー、新規開発支援、既存プロジェクト改善の 3 つの用途に対応した包括的なベストプラクティス集です。

### 主要な変更点サマリー

- **React 19 完全サポート**: 新しいフックと改善されたハイドレーション
- **キャッシングデフォルト変更**: 明示的なキャッシング設定が必要
- **非同期 Request API**: cookies、headers、params が非同期化
- **Turbopack 安定化**: 開発パフォーマンスの大幅向上
- **Partial Prerendering**: 静的・動的コンテンツの最適な組み合わせ

---

## Next.js v15 の新機能と破壊的変更

### 1. React 19 サポートと非同期 API

**🔴 重要な破壊的変更: すべての Request API が非同期になりました**

```javascript
// ❌ 古い書き方 (Next.js 14以前)
import { cookies, headers } from 'next/headers'

export default function Page() {
  const cookieStore = cookies()
  const headersList = headers()
  const token = cookieStore.get('token')
  return <div>...</div>
}

// ✅ 新しい書き方 (Next.js 15)
import { cookies, headers } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const headersList = await headers()
  const token = cookieStore.get('token')
  return <div>...</div>
}
```

### 2. キャッシング戦略の変更

**🔴 重要: デフォルトでキャッシュされなくなりました**

```javascript
// ❌ Next.js 14ではデフォルトでキャッシュされていた
async function getData() {
  const res = await fetch("https://api.example.com/data");
  return res.json();
}

// ✅ Next.js 15では明示的なキャッシング設定が必要
async function getData() {
  const res = await fetch("https://api.example.com/data", {
    cache: "force-cache", // または 'no-store'
    next: { revalidate: 3600 }, // 1時間後に再検証
  });
  return res.json();
}
```

### 3. 動的ルートパラメータの非同期化

```typescript
// ❌ 古い書き方
export default function Page({ params }: { params: { id: string } }) {
  return <div>ID: {params.id}</div>;
}

// ✅ 新しい書き方
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>ID: {id}</div>;
}
```

---

## コードレビュー用ガイドライン

### 1. Server/Client Component の適切な使用確認

**チェックポイント:**

- デフォルトで Server Component を使用しているか
- 'use client'ディレクティブは必要最小限か
- Server Component から Client Component へのデータ受け渡しは適切か

```typescript
// 🔍 レビューポイント: 不要なClient Component化を避ける
// ❌ 悪い例: 静的コンテンツなのにClient Component
"use client";
export function ProductInfo({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}

// ✅ 良い例: Server Componentで十分
export function ProductInfo({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

### 2. データフェッチングパターンの確認

**チェックポイント:**

- ウォーターフォール（順次実行）を避けているか
- 適切な並列フェッチングを実装しているか
- キャッシング戦略は適切か

```typescript
// 🔍 レビューポイント: データフェッチングの効率性
// ❌ 悪い例: ウォーターフォール
async function Page() {
  const user = await getUser();
  const posts = await getUserPosts(user.id); // userを待つ
  const comments = await getPostComments(posts[0].id); // postsを待つ

  return <div>...</div>;
}

// ✅ 良い例: 並列フェッチング
async function Page() {
  const userId = await getUserId(); // 最小限の初期データ

  const [user, posts, comments] = await Promise.all([
    getUser(userId),
    getUserPosts(userId),
    getRecentComments(userId),
  ]);

  return <div>...</div>;
}
```

### 3. セキュリティチェックリスト

**🔴 必須確認事項:**

```typescript
// 🔍 環境変数の露出チェック
// ❌ 絶対にダメ: 機密情報をクライアントに露出
const apiKey = process.env.NEXT_PUBLIC_SECRET_API_KEY; // 危険！

// ✅ 正しい: サーバーサイドのみで使用
const apiKey = process.env.SECRET_API_KEY; // NEXT_PUBLIC_プレフィックスなし

// 🔍 Server Actions のバリデーション
// ❌ 悪い例: 検証なし
("use server");
export async function updateUser(data) {
  await db.user.update(data); // 危険！
}

// ✅ 良い例: 適切な検証とエラーハンドリング
("use server");
import { z } from "zod";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function updateUser(data: unknown) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = updateSchema.parse(data);

  try {
    await db.user.update({
      where: { id: session.userId },
      data: validated,
    });
  } catch (error) {
    throw new Error("Failed to update user");
  }
}
```

---

## 新規開発支援ガイド

### 1. プロジェクト初期設定

```bash
# 推奨: TypeScript + ESLint + Tailwind CSS
npx create-next-app@latest my-app --typescript --eslint --tailwind --app
```

### 2. 推奨プロジェクト構造

```
src/
├── app/                    # App Router
│   ├── (auth)/            # Route Groups
│   │   ├── login/
│   │   └── register/
│   ├── api/               # API Routes
│   │   └── users/
│   ├── dashboard/
│   │   ├── _components/   # Route固有コンポーネント
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── layout.tsx         # Root Layout
├── components/            # 共有コンポーネント
│   ├── ui/               # UIコンポーネント
│   └── forms/            # フォームコンポーネント
├── lib/                   # ユーティリティ
│   ├── db.ts             # データベース
│   ├── auth.ts           # 認証
│   └── utils.ts          # ヘルパー関数
├── hooks/                 # カスタムフック
├── types/                 # TypeScript型定義
└── styles/               # グローバルスタイル
```

### 3. 基本的な Layout 実装

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | My App",
    default: "My App",
  },
  description: "My awesome Next.js app",
  metadataBase: new URL("https://myapp.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 4. 認証パターンの実装

```typescript
// src/lib/auth.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token");

  if (!token) return null;

  try {
    // トークン検証ロジック
    const user = await verifyToken(token.value);
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

// src/app/dashboard/page.tsx
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
    </div>
  );
}
```

---

## 既存プロジェクト改善ガイド

### 1. Next.js 15 への移行チェックリスト

```typescript
// 1. package.jsonの更新
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}

// 2. 非同期APIへの対応
// 全ての cookies(), headers(), params の使用箇所を確認

// 3. キャッシング戦略の見直し
// fetch() の全使用箇所でキャッシング設定を確認

// 4. 動的インポートの最適化
// 大きなコンポーネントはdynamic importに変更
```

### 2. パフォーマンス改善ポイント

```typescript
// 画像最適化の実装
import Image from 'next/image'

// ❌ 改善前: 最適化されていない画像
<img src="/hero.jpg" alt="Hero" />

// ✅ 改善後: Next.js Image コンポーネント
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Above the foldの画像
  placeholder="blur"
  blurDataURL="..." // プレースホルダー画像
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 3. バンドルサイズ削減

```typescript
// 動的インポートによるコード分割
import dynamic from "next/dynamic";

// ❌ 改善前: 全てのコンポーネントを事前読み込み
import HeavyChart from "@/components/HeavyChart";
import AdminPanel from "@/components/AdminPanel";

// ✅ 改善後: 必要時のみ読み込み
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // クライアントサイドのみ
});

const AdminPanel = dynamic(() => import("@/components/AdminPanel"));
```

---

## 共通ベストプラクティス

### 1. エラーバウンダリーの実装

```typescript
// src/app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={reset}>再試行</button>
    </div>
  );
}

// src/app/global-error.tsx
("use client");

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>アプリケーションエラー</h2>
        <button onClick={reset}>アプリを再読み込み</button>
      </body>
    </html>
  );
}
```

### 2. Loading UI の実装

```typescript
// src/app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}
```

### 3. メタデータの最適化

```typescript
// 動的メタデータ
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}
```

---

## アンチパターン集

### 1. パフォーマンスアンチパターン

```typescript
// ❌ アンチパターン1: 不要なuseEffectでのデータフェッチング
"use client";
function BadComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{data?.title}</div>;
}

// ✅ 改善: Server Componentでデータフェッチング
async function GoodComponent() {
  const data = await fetch("https://api.example.com/data").then((res) =>
    res.json()
  );
  return <div>{data.title}</div>;
}

// ❌ アンチパターン2: 大きなコンポーネントの同期インポート
import { HugeComponent } from "./HugeComponent"; // 500KB

// ✅ 改善: 動的インポート
const HugeComponent = dynamic(() => import("./HugeComponent"));
```

### 2. セキュリティアンチパターン

```typescript
// ❌ アンチパターン1: SQLインジェクション脆弱性
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // 危険: 直接SQLに埋め込み
  const user = await db.query(`SELECT * FROM users WHERE id = ${id}`);
  return Response.json(user);
}

// ✅ 改善: パラメータ化クエリ
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || !/^\d+$/.test(id)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: parseInt(id) },
  });

  return Response.json(user);
}
```

### 3. React/Next.js アンチパターン

```typescript
// ❌ アンチパターン1: Server ComponentでのイベントハンドラやuseState
export default function BadServerComponent() {
  const [count, setCount] = useState(0); // エラー！

  return <button onClick={() => setCount(count + 1)}>Click</button>;
}

// ✅ 改善: Client Componentに分離
("use client");
export default function GoodClientComponent() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Click: {count}</button>;
}

// ❌ アンチパターン2: レイアウトシフトを引き起こす実装
function BadImage() {
  return <img src="/large-image.jpg" alt="Large" />;
}

// ✅ 改善: サイズ指定とプレースホルダー
function GoodImage() {
  return (
    <Image
      src="/large-image.jpg"
      alt="Large"
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

---

## まとめ

Next.js v15 を効果的に活用するためには、以下の要点を押さえることが重要です：

1. **Server Components をデフォルトとして使用し、必要な場合のみ Client Components を使用する**
2. **非同期 API への移行を確実に行い、適切なエラーハンドリングを実装する**
3. **明示的なキャッシング戦略を設定し、パフォーマンスを最適化する**
4. **セキュリティベストプラクティスを遵守し、検証とサニタイゼーションを徹底する**
5. **段階的な移行と継続的な改善を通じて、アプリケーションの品質を向上させる**

このガイドラインに従うことで、高品質で保守性の高い Next.js アプリケーションを構築できます。
