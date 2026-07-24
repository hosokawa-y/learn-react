import { useState } from "react";
import { TextInput, Button, Group } from "@mantine/core";
import type { TaskDraft } from "../types/task";

type Props = { onAdd: (draft: TaskDraft) => void };

export function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed === "") return; // 空は追加しない（簡易バリデーション)

    onAdd({
      title: trimmed,
      status: "todo",
      priority: "medium",
      tags: [],
      dueDate: null,
      note: "",
    });
    setTitle(""); // 追加後、入力欄をクリア
  };

  return (
    <Group align="flex-end">
      <TextInput
        label="新しいタスク"
        placeholder="やることを入力"
        value={title} // 表示（stateを流し込む）
        onChange={(e) => setTitle(e.currentTarget.value)} // 反映（stateに書き戻す）
        style={{ flex: 1 }}
      />
      <Button onClick={handleSubmit}>追加</Button>
    </Group>
  );
}
