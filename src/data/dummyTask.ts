import type { Task } from "../types/task";

export const dummyTasks: Task[] = [
  {
    id: "1",
    title: "React公式 Learn を読む",
    status: "in_progress",
    priority: "high",
    tags: ["react", "docs"],
    dueDate: null,
    note: "Thinking in React まで",
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "2",
    title: "useEffect の依存配列を整理",
    status: "todo",
    priority: "medium",
    tags: ["hooks"],
    dueDate: "2026-07-10",
    note: "",
    createdAt: "2026-07-02T09:00:00.000Z",
  },
  {
    id: "3",
    title: "Mantine の導入",
    status: "done",
    priority: "low",
    tags: ["setup"],
    dueDate: null,
    note: "",
    createdAt: "2026-06-28T09:00:00.000Z",
  },
];
