import { Group, Paper, Text, Progress, Stack } from "@mantine/core";

type Props = {
  total: number;
  done: number;
  progress: number; 
};

export function StatsPanel({ total, done, progress}: Props){
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text>合計: {total}件</Text>
          <Text>完了: {done}件</Text>
          <Text>進捗: {progress}%</Text>
        </Group>
        <Progress value={progress} />
      </Stack>
    </Paper>
  )
}
