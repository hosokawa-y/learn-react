# React 基礎学習アプリ 実装計画 ― 学習タスク管理ダッシュボード

## 1. アプリ概要とコンセプト

React の基礎(コンポーネント・state・副作用・Hooks・ルーティング・データ取得)を **一通り、かつ過不足なく** 練習することだけを目的にした小さなSPAを作る。

- **題材**: 学習タスク管理ダッシュボード(タスクの登録・一覧・編集・削除・フィルタ・集計)。
- **なぜこの題材か**: ドメインが単純で「何を作るか」で悩まないため、認知資源をReactの仕組みの理解に全振りできる。それでいてCRUD・派生state・非同期・画面遷移まで自然に登場する。
- **ドメインは差し替え可能**: タスクを「蔵書」「案件」「機材」などに読み替えても計画はそのまま使える。業務のGIS寄りにしたい場合は発展課題(§9)参照。

> 設計方針として、**あえて便利機能に頼らず「基礎の仕組みが見える」実装を優先する**。例えばルーティングは React Router の data mode(loader/action)ではなく declarative mode を使う。loaderはデータ取得をHooksの外に追い出してしまい、`useState`/`useEffect` の練習にならないため。基礎が固まったら発展課題で data mode に触れる。

---

## 2. 学習カバレッジ表(機能 → 学ぶReact概念)

| 機能 | 主に学ぶReact概念 | Vue経験からの差分 |
|---|---|---|
| タスク一覧の表示 | JSX / props / `map`+`key` / 条件描画 | `v-for`/`v-if` との対応 |
| 新規作成フォーム | controlled component / イベント | `v-model` の代替 |
| 完了トグル・削除 | 不変なstate更新 / setter | `reactive` の破壊的変更が使えない |
| 検索・フィルタ・ソート | 派生state / `useMemo` | `computed` は手動メモ化になる |
| 集計パネル(件数・進捗) | stateからの計算 / コンポーネント分割 | ― |
| API連携(取得・保存) | `useEffect` → TanStack Query | サーバ状態という考え方 |
| 検索のデバウンス | custom hook(`useDebounce`) | composable とほぼ同じ設計 |
| 詳細ページ遷移 | React Router(declarative) | Vue Router との対応 |
| テーマ切替(light/dark) | `useContext` | `provide`/`inject` の対応 |
| フィルタ条件の共有 | Zustand(クライアント状態) | Pinia の対応 |
| 画面の体裁 | UIライブラリ(Mantine/MUI) | Quasar の対応 |

---

## 3. 技術スタックと選定理由

すべて現行(2026年時点)の標準的な組み合わせ。Quasar Vite に慣れているのでビルド周りは違和感が少ないはず。

| 分類 | 採用 | 理由 |
|---|---|---|
| 言語 | TypeScript | 型付けに慣れているので最初から使う |
| ビルド | Vite | Quasarと同じ。設定資産を流用しやすい |
| UIライブラリ | React 19 系 | 現行。関数コンポーネント+Hooksが標準 |
| ルーティング | React Router(`react-router` パッケージ、v7/v8系) | 定番。**declarative mode** で使う |
| サーバ状態 | TanStack Query v5 | データ取得・キャッシュの定番。投資価値が高い |
| クライアント状態 | Zustand | Piniaに近い軽量さ。学習コストが低い |
| UIコンポーネント | Mantine(または MUI) | Quasar相当の「一式入り」。Mantineはhooksが充実 |
| APIモック | json-server(v1系) | JSONファイルから即席REST API。バックエンド不要 |
| 品質 | ESLint + `eslint-plugin-react-hooks` | 依存配列ミスを機械検出。**必須** |

> 注意:現行の React Router はパッケージ名が `react-router`(旧 `react-router-dom` ではない)。基本の `BrowserRouter` / `Routes` / `Route` / `Link` / `useParams` / `useNavigate` はここから import する。
> 注意:json-server の v1系ではレコードの **id は文字列**(自動採番も文字列)。TS型の `id` も `string` にする。

---

## 4. データモデル

タスク1エンティティで十分。TypeScriptの型を先に決める。

```ts
// src/types/task.ts
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;            // json-server v1 は文字列ID
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate: string | null; // ISO文字列 or null
  note: string;
  createdAt: string;      // ISO文字列
};

// 新規作成時はサーバ側で採番する項目を除く
export type TaskDraft = Omit<Task, 'id' | 'createdAt'>;
```

APIモック用の初期データ:

```json
// db.json
{
  "tasks": [
    { "id": "1", "title": "React公式 Learn を読む", "status": "in_progress", "priority": "high", "tags": ["react", "docs"], "dueDate": null, "note": "Thinking in React まで", "createdAt": "2026-07-01T09:00:00.000Z" },
    { "id": "2", "title": "useEffect の依存配列を整理", "status": "todo", "priority": "medium", "tags": ["hooks"], "dueDate": "2026-07-10", "note": "", "createdAt": "2026-07-02T09:00:00.000Z" }
  ]
}
```

---

## 5. API(json-server)

バックエンドを書かずにREST APIを用意する。

```bash
# 開発依存として導入(本番バンドルに入れない)
npm install -D json-server

# 起動(別ターミナル)。--watch でファイル変更を反映
npx json-server db.json --watch
# → http://localhost:3000/tasks で GET/POST/PUT/PATCH/DELETE が使える
```

自動生成される主なエンドポイント:

- `GET /tasks` 一覧(`?status=todo` などのフィルタ、`_sort` ソート、`_page`/`_per_page` ページングに対応)
- `GET /tasks/:id` 単体
- `POST /tasks` 作成(idは自動採番=文字列)
- `PUT /tasks/:id` 全体更新 / `PATCH /tasks/:id` 部分更新
- `DELETE /tasks/:id` 削除

`package.json` にスクリプト化しておくと楽:

```json
{
  "scripts": {
    "dev": "vite",
    "api": "json-server db.json --watch"
  }
}
```

> フロントは `http://localhost:5173`、APIは `http://localhost:3000`。学習用途なのでCORSは基本問題にならないが、必要なら Vite の `server.proxy` で `/api` をjson-serverに転送する構成にすると本番に近い形を学べる(発展)。

---

## 6. ディレクトリ構成

```
src/
├── main.tsx                # エントリ。Provider類をここでまとめる
├── App.tsx                 # ルーティング定義(declarative)
├── types/
│   └── task.ts
├── api/
│   └── tasks.ts            # fetchラッパー(GET/POST/PATCH/DELETE)
├── hooks/
│   ├── useDebounce.ts      # custom hook 練習
│   └── useTasks.ts         # TanStack Query のラッパー
├── store/
│   └── filterStore.ts      # Zustand(フィルタ条件)
├── context/
│   └── ThemeContext.tsx    # useContext 練習
├── components/
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   ├── TaskForm.tsx
│   ├── FilterBar.tsx
│   └── StatsPanel.tsx
└── pages/
    ├── DashboardPage.tsx   # 一覧+フィルタ+集計
    └── TaskDetailPage.tsx  # 詳細+編集
```

---

## 7. 画面・ルート設計

declarative mode の最小構成:

```tsx
// App.tsx(イメージ)
<BrowserRouter>
  <Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/tasks/:id" element={<TaskDetailPage />} />
    <Route path="*" element={<NotFound />} />   {/* 404 のキャッチオール */}
  </Routes>
</BrowserRouter>
```

- **`/`(ダッシュボード)**: フィルタバー + 集計パネル + タスク一覧 + 新規作成フォーム。
- **`/tasks/:id`(詳細)**: `useParams` でid取得 → 該当タスクを表示・編集・削除。
- **`*`(404)**: 未定義ルートのフォールバック。

---

## 8. 実装ステップ(マイルストーン)

前回の学習プランのフェーズに沿って、1本のアプリを段階的に育てる。各ステップに「学ぶこと」と「完了条件(Doneの定義)」を置く。**前ステップが動いてから次へ**進む。

### ステップ0:プロジェクト作成と土台(0.5日)
- **作業**: `npm create vite@latest`(react-ts)→ ESLint に `eslint-plugin-react-hooks` を有効化 → Mantine 導入 → 何か1つ画面に文字を出す。
- **学ぶ**: Vite+React+TSの起動、JSXの基本。
- **完了条件**: `npm run dev` でトップに任意のテキストが表示される。

### ステップ1:静的な一覧表示(0.5日)
- **作業**: `Task[]` のダミー配列をコード内に持ち、`TaskList` → `TaskItem` にpropsで渡して描画。
- **学ぶ**: props、`map`+`key`、コンポーネント分割、条件描画(statusバッジの出し分け)。
- **完了条件**: ダミーデータがカード/行で一覧表示される。keyの警告が出ていない。

### ステップ2:ローカルstateでCRUD(1〜1.5日)
- **作業**: `useState<Task[]>` で一覧を保持。`TaskForm` で追加、`TaskItem` で完了トグル・削除。まだAPIは使わない。
- **学ぶ**: `useState`、controlled component(フォーム)、イベント、**不変更新**(`[...tasks, newTask]` / `map` で置換 / `filter` で削除)、子→親のコールバックprops。
- **完了条件**: 画面上で追加・完了切替・削除ができる(リロードで消えてOK)。
- **重点**: ここでVue経験者が最も引っかかる「破壊的変更をしない」「emitではなく関数propsを渡す」を体に入れる。

### ステップ3:フィルタ・検索・集計(1日)
- **作業**: 検索ボックス、status/priorityフィルタ、並び替えを追加。表示用リストは元データから**派生**させる。集計パネルで件数と進捗率を表示。
- **学ぶ**: 派生state(stateを増やさず計算で出す)、`useMemo` の使いどころ、`computed` との違い。
- **完了条件**: フィルタ・検索・ソートが同時に効く。集計がリアルタイムに追従する。
- **重点**: 「フィルタ結果を別のstateに持たない」。派生は都度計算し、重いときだけ `useMemo`。

### ステップ4:custom hook でロジック分離(0.5日)
- **作業**: 検索入力を `useDebounce` に切り出す。将来のAPI取得を見据え、ロジックをコンポーネントから剥がす練習。
- **学ぶ**: custom hook(composableとの類似)、`useEffect` + cleanup(タイマーの後始末)。
- **完了条件**: 入力が落ち着いてからフィルタが走る。hookが再利用可能な形になっている。

### ステップ5:API化(素のuseEffect版)(1日)
- **作業**: json-server を起動し、まず **あえて `useEffect` + `fetch` + `useState`** で一覧取得・作成・更新・削除を実装。ローディング/エラー状態も手で管理。
- **学ぶ**: `useEffect` による副作用と依存配列、非同期の扱い、stale closure の実感、後片付け(AbortControllerでのキャンセル)。
- **完了条件**: リロードしてもデータが保持される。ローディング表示とエラー表示が出る。
- **重点**: この「手作業のつらさ」を体験しておくと、次のTanStack Queryのありがたみが分かる。

### ステップ6:TanStack Query へ置換(1日)
- **作業**: ステップ5の手動取得を `useQuery` / `useMutation` に置換。`QueryClientProvider` を `main.tsx` に設定。作成・更新・削除後は該当クエリを無効化して再取得。
- **学ぶ**: サーバ状態とクライアント状態の分離、キャッシュ、`queryKey` 設計、楽観的更新(余裕があれば)。
- **完了条件**: 自前のローディング/エラー管理コードが消え、コードが短くなる。再取得・キャッシュが効く。

### ステップ7:ルーティングで詳細ページ(0.5〜1日)
- **作業**: `/tasks/:id` を追加。一覧からリンク、詳細で `useParams` → 単体取得 → 編集・削除 → `useNavigate` で一覧へ戻る。404も用意。
- **学ぶ**: React Router(declarative)、URLパラメータ、プログラム遷移。
- **完了条件**: 一覧↔詳細を行き来でき、URL直打ちでも詳細が開く。

### ステップ8:Context とグローバル状態(0.5日)
- **作業**: テーマ(light/dark)を `ThemeContext` で全体共有。フィルタ条件を Zustand に移し、ページをまたいでも保持されるようにする。
- **学ぶ**: `useContext`(provide/injectの対応)、Zustand(Piniaの対応)、「Contextで足りる/状態管理ライブラリが要る」の線引き。
- **完了条件**: テーマ切替が全画面に反映。フィルタ条件が遷移後も維持される。

### ステップ9:仕上げ(0.5日)
- **作業**: Mantineでレイアウト・空状態・エラー表示を整える。フォームの簡単なバリデーション。
- **学ぶ**: UIライブラリの実戦投入、UX的な状態(空/読み込み/エラー)の扱い。
- **完了条件**: 一通り破綻なく操作でき、見た目が整っている。

> 目安合計:**実働7〜9日**(週5〜8時間なら3〜4週間)。各ステップをgitでコミットしていくと復習・巻き戻しがしやすい。

---

## 9. 発展課題(基礎が固まってから)

- **地図表示(業務寄り)**: タスクに緯度経度を持たせ、**React Leaflet** で地図にピン表示。GIS/MongoDBの空間データに繋げやすい。ただし地図はハマりどころが多いので基礎習得後に。
- **React Router data mode**: 同じアプリを loader / action で書き直し、Hooks版との設計差を体感する。
- **テスト**: Vitest + React Testing Library で `TaskForm` や custom hook にテストを書く。
- **Vite proxy**: `/api` をjson-serverへプロキシし、環境変数でAPIベースURLを切り替える(本番に近い構成)。
- **Next.js素振り**: 一覧ページだけ Next.js(App Router)に移植し、Server Components / Client Components の境界を体験する。

---

## 10. つまずき対策・チェックリスト

Vue経験者がReactで詰まりやすい点を、このアプリの文脈で先回り。

- [ ] state更新は必ずsetter経由で、**新しい参照**を作る(`reactive` の破壊的変更はしない)。
- [ ] 子→親は **emitではなくコールバックprops**。
- [ ] フォームは **controlled component**(value + onChange)。`v-model` は無い。
- [ ] フィルタ結果などは**stateに持たず派生で計算**。重いときだけ `useMemo`。
- [ ] `useEffect` の依存配列を正しく書く。ESLintの `react-hooks` ルールを常時ON。
- [ ] 非同期処理は cleanup(AbortController)で後始末。stale closure に注意。
- [ ] サーバ状態(TanStack Query)とクライアント状態(useState/Zustand)を混同しない。
- [ ] `key` に配列indexを使わない(並び替え・削除で不具合)。安定したid(=task.id)を使う。
- [ ] import元は `react-router`(旧 `react-router-dom` ではない)。
- [ ] json-server v1 の id は**文字列**。型と処理を文字列前提にする。

---

## 参考(各フェーズで該当箇所だけ読む)

- React 公式 (react.dev) ― "Learn React" / "Thinking in React" / "You Might Not Need an Effect"
- TanStack Query 公式ドキュメント
- React Router 公式(declarative mode)
- Zustand / Mantine(または MUI)公式
- json-server(GitHub / npm)
