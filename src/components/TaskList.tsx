import { Stack, Text } from "@mantine/core";
import type { Task } from "../types/task";
import { TaskItem } from "./TaskItem";

type Props = { 
  tasks: Task[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
 };

export function TaskList({ tasks, onToggle, onRemove }: Props) {
  if (tasks.length === 0) {
    return <Text c="dimmed">タスクがありません</Text>;
  }

  return (
    <Stack gap="sm">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </Stack>
  );
}
