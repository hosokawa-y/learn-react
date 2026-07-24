import { Group, TextInput, SegmentedControl, Select } from "@mantine/core";
import type { TaskStatus } from "../types/task";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskStatus | "all";
  onStatusFilterChange: (value: TaskStatus | "all") => void;
  sortBy: "createdAt" | "priority";
  onSortByChange: (value: "createdAt" | "priority") => void;
};

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}: Props) {
  return (
    <Group align="flex-end">
      <TextInput
        label="検索"
        placeholder="タイトルで検索"
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        style={{ flex: 1 }}
      />
      <SegmentedControl
        value={statusFilter}
        onChange={(value) => onStatusFilterChange(value as TaskStatus | "all")}
        data={[
          { label: "すべて", value: "all" },
          { label: "未着手", value: "todo" },
          { label: "進行中", value: "in_progress" },
          { label: "完了", value: "done" },
        ]}
      />
      <Select
        label="並べ替え"
        value={sortBy}
        onChange={(value) => onSortByChange(value as "createdAt" | "priority")}
        data={[
          { label: "作成日（新しい順）", value: "createdAt" },
          { label: "優先度", value: "priority" },
        ]}
        allowDeselect={false}
      />
    </Group>
  );
}
