# React 学習メモ:StrictMode の二重実行

## 1. StrictMode の二重実行

### 現象

開発モード(`yarn dev`)でタスクを1回追加すると、`addTask` 内の updater 関数(や `console.log`)が **2回** 走る。

### 原因

`main.tsx` の `<StrictMode>` により、**開発モードのときだけ** React が state 更新関数などを意図的に2回呼ぶ。バグではなく検査機構。

```tsx
// main.tsx
<StrictMode>
  <MantineProvider defaultColorScheme="light">
    <App />
  </MantineProvider>
</StrictMode>
```

### 目的:updater が「純粋関数」かを炙り出す

updater(`setTasks` に渡す関数)は**純粋関数**であるべき、という規約がある。純粋関数 = 同じ入力に同じ出力を返し、外部に副作用を持たない関数。2回呼んでも結果が同じなら純粋。結果が変わるなら「副作用が混ざっている」サイン。

### 実践ルール:変わる値は updater の外で確定させる

```tsx
// OK: ID・現在時刻を updater の外で1回だけ確定
const addTask = (draft: TaskDraft) => {
  const newTask: Task = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  setTasks((prev) => [newTask, ...prev]) // prev だけを使う純粋な計算
}
```

```tsx
// NG: updater の中で毎回変わる値を生成
setTasks((prev) => [
  { ...draft, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
  ...prev,
]) // 二重実行で違うIDが2つでき得る
```

**要点**: updater の中は「渡された `prev` だけを使って新しい値を計算する」純粋処理に保つ。ID・現在時刻・乱数など**呼ぶたびに変わるもの**は updater の外で確定させておく。

### 補足

- 二重実行は**開発モード限定**。`yarn build` の本番ビルドでは1回だけ。「本番でタスクが2個増える」心配は不要。
- **StrictModeは外さない**。`useEffect` の副作用(API呼び出し・タイマー等)の cleanup が正しく書けているかも検査してくれる。学習中はむしろ有益。

---

## 2. まとめ(チェックリスト)

- [ ] ID・時刻・乱数など変わる値は updater の外で確定させる。
- [ ] 開発時の二重実行は StrictMode による検査。バグではない。本番では1回。
- [ ] StrictMode は外さない。