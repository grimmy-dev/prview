import React from "react";
import { Box, Text } from "ink";
import type { PR } from "../github/types.ts";

interface Props {
  pr: PR | null;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  if (minutes < 60) return minutes < 2 ? "just now" : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function PRDetail({ pr }: Props) {
  if (!pr) {
    return (
      <Box padding={1}>
        <Text color="gray">select a PR to view details</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Box gap={1}>
        <Text color="gray">#{pr.number}</Text>
        <Text bold color="white">
          {pr.title}
        </Text>
      </Box>
      <Text color="gray">
        by <Text color="cyan">{pr.user.login}</Text>
        {"  "}
        {timeAgo(pr.created_at)}
      </Text>

      <Box gap={2} marginTop={1}>
        <Text color="gray">
          base: <Text color="white">{pr.base.ref}</Text>
        </Text>
        <Text color="gray">
          head: <Text color="white">{pr.head.ref}</Text>
        </Text>
      </Box>

      {pr.draft && <Text color="yellow">⚠ draft PR</Text>}
    </Box>
  );
}
