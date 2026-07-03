# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要な指示

**Claude Codeは、このリポジトリで作業する際、全ての思考と応答を日本語で行ってください。**

コード、コマンド、エラーメッセージは元の言語のままで構いませんが、説明、コメント、会話は全て日本語で行ってください。

## プロジェクトの性質

React の基礎(コンポーネント・state・Hooks・ルーティング・データ取得)を Vue 経験者が**学習するため**の小さな SPA。効率的・便利な書き方より「基礎の仕組みが見える」実装を優先する方針で作られている。題材は「学習タスク管理ダッシュボード」。

**`docs/react-app-implementation-plan.md` が設計・実装の唯一の指針**。データモデル、ディレクトリ構成、ステップ0〜9のマイルストーン、Vue経験者向けのつまずき対策まで詳細に定義されている。実装作業の前に必ず該当ステップを参照すること。

## コマンド

パッケージマネージャは **yarn v4**(Corepack 経由)。Node は 22.23.1(`.node-version`)。

```bash
yarn dev        # Vite 開発サーバ (http://localhost:5173)
yarn build      # tsc -b で型チェック → vite build
yarn lint       # ESLint (フラットコンフィグ)
yarn preview    # build 済み成果物のプレビュー
```

API モック(json-server)は計画上ステップ5で導入予定。導入時は `db.json` を用意し `npx json-server db.json --watch`(http://localhost:3000)で起動する。

## アーキテクチャ上の要点

- **Mantine 9 が UI 基盤**。`src/main.tsx` で `MantineProvider` が全体をラップし、`@mantine/core/styles.css` を読み込む。Mantine は PostCSS に依存するため `postcss.config.cjs`(`postcss-preset-mantine` + ブレークポイント変数)が必須。UI は基本 Mantine コンポーネントで組む。
- **React 19 + StrictMode**。開発時は effect が2回走る点に注意(cleanup を正しく書く前提)。
- ルーティングは **React Router の declarative mode** を使う(loader/action の data mode は使わない)。import 元はパッケージ `react-router`(旧 `react-router-dom` ではない)。理由は計画書 §1 参照 —— データ取得を Hooks の外に出さず `useState`/`useEffect` の練習にするため。
- 状態は3層に分ける:サーバ状態は TanStack Query、クライアント横断状態は Zustand、ローカル状態は `useState`。混同しない。
- **json-server v1 の id は文字列**。`Task.id` の型も `string` にする。

## 実装時の遵守事項(計画書 §10 より、Vue との差分)

- state 更新は必ず setter 経由で**新しい参照**を作る(破壊的変更をしない)。
- 子→親は emit ではなく**コールバック props**。
- フォームは controlled component(`value` + `onChange`)。`v-model` は無い。
- フィルタ・検索結果などは state に持たず**派生で計算**。重いときだけ `useMemo`。
- `useEffect` の依存配列を正しく書く。`eslint-plugin-react-hooks` は常時 ON(lint 必須)。
- `key` に配列 index を使わない。安定した id を使う。
