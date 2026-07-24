import { Card, Text, Badge, Group, Stack, Button } from "@mantine/core";
import type { Task, TaskStatus, TaskPriority } from "../types/task";

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

// status/priorityを色に対応づける小さなヘルパー
const statusColor: Record<TaskStatus, string> = {
  todo: "grey",
  in_progress: "blue",
  done: "green",
};

const priorityColor: Record<TaskPriority, string> = {
  low: "teal",
  medium: "yellow",
  high: "red",
};

export function TaskItem({ task, onToggle, onRemove }: Props) {
  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={600}>{task.title}</Text>
          <Badge color={statusColor[task.status]}>{task.status}</Badge>
        </Group>

        <Group gap="xs">
          <Badge variant="light" color={priorityColor[task.priority]}>
            {task.priority}
          </Badge>
          {task.tags.map((tag) => (
            <Badge key={tag} variant="outline" color="grey">
              {tag}
            </Badge>
          ))}
        </Group>

        {task.dueDate && (
          <Text size="sm" c="dimmed">
            期限: {task.dueDate}
          </Text>
        )}
        {task.note && <Text size="sm">{task.note}</Text>}

        <Group gap="xs">
          <Button size="xs" variant="light" onClick={() => onToggle(task.id)}>
            {task.status == "done" ? "未完了に戻す" : "完了にする"}
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            onClick={() => onRemove(task.id)}
          >
            削除
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
