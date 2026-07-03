import { Card, Text, Badge, Group, Stack } from "@mantine/core";
import type { Task, TaskStatus, TaskPriority } from "../types/task";

type Props = { task: Task };

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

export function TaskItem({ task }: Props) {
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
      </Stack>
    </Card>
  );
}
