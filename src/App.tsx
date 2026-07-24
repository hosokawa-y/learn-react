import { useState } from "react";
import { Container, Title, Stack } from "@mantine/core";
import { TaskList } from "./components/TaskList";
import { dummyTasks } from "./data/dummyTask";
import { TaskForm } from "./components/TaskForm";
import type { Task, TaskStatus, TaskDraft } from "./types/task";

function App() {
  const [tasks, setTasks] = useState<Task[]>(dummyTasks);

  // 完了トグル：対象idだけstatusを差し替えた「新しい配列」を作る
  const toggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const next: TaskStatus = task.status === "done" ? "todo" : "done";
        return { ...task, status: next }; // 対象だけ新しいオブジェクトに
      }),
    );
  };

  // 削除：対象idを除いた「新しい配列」を作る
  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const addTask = (draft: TaskDraft) => {
    const newTask: Task = {
      ...draft,
      id: crypto.randomUUID(), // ブラウザ標準のID生成
      createdAt: new Date().toISOString(),
    };
    // prevにはReactが保持している、その時点での最新のtasksの値が入る
    setTasks((prev) => {
      console.log("prevの中身: ", prev);
      return [newTask, ...prev];
    }); // 先頭に足した「新しい配列」
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>学習タスク管理</Title>
        <TaskForm onAdd={addTask} />
        <TaskList tasks={tasks} onToggle={toggleStatus} onRemove={removeTask} />
      </Stack>
    </Container>
  );
}

export default App;
