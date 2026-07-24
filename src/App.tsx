import { useState, useMemo } from "react";
import { Container, Title, Stack } from "@mantine/core";
import { TaskList } from "./components/TaskList";
import { dummyTasks } from "./data/dummyTask";
import { TaskForm } from "./components/TaskForm";
import type { Task, TaskStatus, TaskDraft, TaskPriority } from "./types/task";
import { StatsPanel } from "./components/StatsPanel";
import { FilterBar } from "./components/FilterBar";

function App() {
  const [tasks, setTasks] = useState<Task[]>(dummyTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "priority">("createdAt");

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

  // 表示用リスト = 検索 -> statusフィルタ -> ソート を適用した派生データ
  // tasks/search/statusFilter/sortByのどれかが変わったら再計算する
  const visibleTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const priorityRank: Record<TaskPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return tasks
      .filter((task) => {
        const matchesKeyword =
          keyword === "" || task.title.toLowerCase().includes(keyword);
        const matchesStatus =
          statusFilter === "all" || task.status === statusFilter;
        return matchesKeyword && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          return priorityRank[a.priority] - priorityRank[b.priority];
        }
        // createdAtの新しい順
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [tasks, search, statusFilter, sortBy]);

  // 集計 = tasksから計算する派生データ
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length
    const progress = total === 0 ? 0 : Math.round((done/total) * 100)
    return { total, done, progress}
  }, [tasks])

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>学習タスク管理</Title>
        <StatsPanel total={stats.total} done={stats.done} progress={stats.progress} />
        <TaskForm onAdd={addTask} />
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          />
        <TaskList tasks={visibleTasks} onToggle={toggleStatus} onRemove={removeTask} />
      </Stack>
    </Container>
  );
}

export default App;
