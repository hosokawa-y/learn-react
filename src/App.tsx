import { useState } from "react";
import { Container, Title, Stack } from "@mantine/core";
import { TaskList } from "./components/TaskList";
import { dummyTasks } from "./data/dummyTask";
import type { Task, TaskStatus } from "./types/task";

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

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>学習タスク管理</Title>
        <TaskList tasks={tasks} onToggle={toggleStatus} onRemove={removeTask} />
      </Stack>
    </Container>
  );
}

export default App;
