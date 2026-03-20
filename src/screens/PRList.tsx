import React from "react";
import { Box, Text } from "ink";
import type { PR } from "../github/types.ts";

interface Props {
  prs: PR[];
  loading: boolean;
  error: string | null;
  selectedIndex: number;
}

export default function PRList({ prs, loading, error, selectedIndex }: Props) {
  if (loading) return <Text color="yellow">fetching PRs...</Text>;
  if (error) return <Text color="red">{error}</Text>;
  if (prs.length === 0) return <Text color="gray">no open PRs</Text>;

  return (
    <Box flexDirection="column">
      {prs.map((pr, i) => (
        <Box key={pr.number} paddingX={1}>
          <Text color={i === selectedIndex ? "cyan" : "white"}>
            {i === selectedIndex ? "▶ " : "  "}
            {pr.title}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
