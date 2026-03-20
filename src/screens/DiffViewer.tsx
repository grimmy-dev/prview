import React from "react";
import { Box, Text } from "ink";
import type { DiffFile } from "../github/types.ts";

interface Props {
  files: DiffFile[];
  loading: boolean;
  fileIndex: number;
}

function renderPatch(patch: string) {
  return patch.split("\n").map((line, i) => {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      return (
        <Text key={i} color="green">
          {line}
        </Text>
      );
    }
    if (line.startsWith("-") && !line.startsWith("---")) {
      return (
        <Text key={i} color="red">
          {line}
        </Text>
      );
    }
    if (line.startsWith("@@")) {
      return (
        <Text key={i} color="cyan">
          {line}
        </Text>
      );
    }
    return (
      <Text key={i} color="gray">
        {line}
      </Text>
    );
  });
}

export default function DiffViewer({ files, loading, fileIndex }: Props) {
  if (loading) return <Text color="yellow">loading diff...</Text>;
  if (files.length === 0) return <Text color="gray">no files changed</Text>;

  const file = files[fileIndex];
  if (!file) return null;

  return (
    <Box flexDirection="column" padding={1}>
      {/* file header */}
      <Box gap={2} marginBottom={1}>
        <Text bold color="white">
          {file.filename}
        </Text>
        <Text color="green">+{file.additions}</Text>
        <Text color="red">-{file.deletions}</Text>
        <Text color="gray">
          {fileIndex + 1}/{files.length} files
        </Text>
      </Box>

      {/* file navigation hint */}
      <Text color="gray" dimColor>
        [←→] switch files
      </Text>

      {/* patch */}
      <Box flexDirection="column" marginTop={1}>
        {file.patch ? (
          renderPatch(file.patch)
        ) : (
          <Text color="gray">binary file or no patch available</Text>
        )}
      </Box>
    </Box>
  );
}
