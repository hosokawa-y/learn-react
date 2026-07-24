# React 学習メモ:useState の更新

## 1. 大原則:state は書き換えず、新しい値を作って渡す

Reactのstateは**直接ミューテートしない**。追加・更新・削除はすべて「新しい配列/オブジェクト」を作って setter に渡す。

```tsx
// 追加: 新しい配列
setTasks((prev) => [newTask, ...prev])
// 更新: 対象だけ差し替えた新しい配列
setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: next } : t)))
// 削除: 対象を除いた新しい配列
setTasks((prev) => prev.filter((t) => t.id !== id))
```

**Vueとの差分**: Vueの `reactive` 配列は `tasks.push(...)` や `task.status = 'done'` と破壊的に書き換えても追跡されて再描画された。Reactは参照が変わらないと変化を検知できず再レンダリングされないため、破壊的変更はNG。

---

## 2. `setState` の2つの渡し方

```tsx
// (A) 値を直接渡す
setTasks([newTask, ...tasks])

// (B) 関数を渡す(関数型アップデート / functional update)
setTasks((prev) => [newTask, ...prev])
```

### `prev` の正体

`prev` には **Reactが保持している「その時点での最新の state」** が入る。渡した関数を、React が「現在のstateを引数に入れて」呼び出し、その戻り値を次のstateにする。

- `prev` に何を入れるかを決めるのは **React 側**。
- こちらは「最新値を受け取ったら、それを使ってどう新しい値を作るか」だけを書く。
- `prev` は単なる引数名。`p` でも `current` でもよい(慣習で `prev`)。

### なぜ (B) が推奨か:stale closure 対策

stateの更新は即時ではなく**バッチ処理**される。そのため (A) の `tasks` は「この関数が定義された時点で見えていた古い値」を指し、状況次第で古い値(stale)を掴む。

```tsx
// (A) 値渡し: 2回続けて呼ぶと両方「元のtasks」を見て、片方が上書きで消える
setTasks([X, ...tasks])   // 元を見る
setTasks([Y, ...tasks])   // これも元を見る → X が消える

// (B) 関数渡し: 2回目は「Xが入った後の最新」を受け取る → X も Y も残る
setTasks((prev) => [X, ...prev])
setTasks((prev) => [Y, ...prev])
```

単発の更新なら (A) でも動くが、非同期(APIレスポンス後の更新など)が絡むと (A) の落とし穴が出る。**最初から (B) を癖にする**のが安全。

**Vueとの差分**: Vueは「今の値」を常に `tasks.value` で取れたので、この「更新前の最新値を関数経由で受け取る」発想自体が要らなかった。「新しい値を作るには古い値が要る → その古い値(最新版)を安全に受け取る口が引数 `prev`」というのがReactの設計。

---

## 3. まとめ(チェックリスト)

- [ ] state は破壊的変更しない。常に新しい配列/オブジェクトを作る。
- [ ] `setState` は基本 `(prev) => ...` の関数型で書く(stale closure 対策)。
- [ ] updater 関数は純粋に保つ。`prev` だけを使う。