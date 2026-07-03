import { Container, Title, Stack } from "@mantine/core";
import { TaskList } from "./components/TaskList";
import { dummyTasks } from "./data/dummyTask";

function App() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>学習タスク管理</Title>
        <TaskList tasks={dummyTasks} />
      </Stack>
    </Container>
  );
}

export default App;
