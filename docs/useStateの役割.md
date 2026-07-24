# React 学習メモ:useState の役割

> 学習タスク管理アプリ(ステップ2〜3)を通して整理した「そもそも useState は何をするものか」。
> 対になるメモ: `react-state-notes.md`(state の更新の仕方 / prev / StrictMode)。

---

## 1. 一言でいうと

**「再レンダリングをまたいで値を保持し、その値が変わったら画面を更新する」ための仕組み。**

- 値を覚えておく(保持)
- 変わったら描き直す(再レンダリングのトリガー)

この2つがセットになっているのが核心。

---

## 2. なぜ普通の変数ではダメなのか

前提:**state が変わるとコンポーネント関数は丸ごと再実行される。**

```tsx
function Counter() {
  let count = 0                          // 普通の変数
  return <button onClick={() => count++}>{count}</button>
}
```

これが動かない理由は2つ:

1. `count++` しても React は「変わった」と気づけず、**再レンダリングが起きない**。
2. 仮に再レンダリングされても、関数が最初から実行し直されて `let count = 0` に**毎回リセット**される。

`useState` は両方を解決する:

```tsx
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

- `useState` の値は **React が関数の外側で覚えている**ので再レンダリングで消えない。
- `setCount` を呼ぶことが **「変わったから描き直して」という合図**になる。

---

## 3. 返り値の3要素

```tsx
const [count, setCount] = useState(0)
//     ↑現在の値  ↑更新関数        ↑初期値
```

- **現在の値**(`count`): 今表示すべき値。読み取り専用のつもりで扱う。
- **更新関数**(`setCount`): これを呼んで初めて再レンダリングされる。**直接 `count = ...` と代入してはいけない**。
- **初期値**(`0`): 最初のレンダリング時だけ使われる。2回目以降は無視され、覚えている値が使われる。

---

## 4. 「値を覚える」と「描き直す」を分けて見る

```tsx
const [tasks, setTasks] = useState<Task[]>(dummyTasks)
```

- **覚える**: `tasks` は追加・検索・トグルのたびの再レンダリングをまたいで保持される。だからタスクが消えない。
- **描き直す**: `setTasks(...)` を呼んだ瞬間に React が「変わった」と判断し、`App` を再レンダリングして新しい `tasks` で画面を描き直す。

補足:React は前回の値と今回の値を**参照で比較**して変化を判定する。だから setter には**新しい配列/オブジェクト**を渡す必要がある(破壊的変更は参照が変わらず検知されない)。→ 詳細は `react-state-notes.md`。

---

## 5. 何を useState にすべきか(判断基準)

| 分類 | 定義 | このアプリでの例 | 扱い |
|---|---|---|---|
| **入力(state にする)** | 操作や外部要因で変わる、他から計算できない値 | `tasks` / `search` / `statusFilter` / `sortBy` / `title` | `useState` |
| **派生(state にしない)** | 他の state から計算で出せる値 | `visibleTasks`(フィルタ結果) / `stats`(集計) | レンダリング中に計算(必要なら `useMemo`) |

判断の型:**「この値は覚えておくべき入力か、それとも計算で出せる派生か」** を毎回問う。派生を state に持つと二重管理になりズレる。

---

## 6. Vue 3 との対応

| | Vue 3 | React |
|---|---|---|
| リアクティブな値 | `const count = ref(0)` | `const [count, setCount] = useState(0)` |
| 読む | `count.value` | `count` |
| 書く | `count.value = 1`(直接代入OK) | `setCount(1)`(setter必須・直接代入NG) |
| 変化の検知 | 自動追跡 | setter の呼び出し + 参照比較 |

**最大の差分**: Vue の `ref` は `.value` への直接代入が自動追跡されて再描画された。React は「代入」ではなく「**setter を呼ぶ**」ことが再描画のトリガーで、しかも**新しい参照**を渡す必要がある。

---

## 7. まとめ

- `useState` = 値の保持 + 変化時の再レンダリング。
- 値は setter 経由でのみ更新(直接代入NG)。
- 初期値は初回のみ有効。
- 入力は state、派生は計算。
- 変化検知は参照比較なので、新しい参照を渡す。