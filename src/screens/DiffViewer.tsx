import React from "react";
import { Box, Text } from "ink";
import type { DiffFile } from "../github/types.ts";

interface Props {
  files: DiffFile[];
  loading: boolean;
  fileIndex: number;
  scrollOffset: number;
}

export const VISIBLE_LINES = 15;

function renderPatch(patch: string, scrollOffset: number) {
  const allLines = patch.split("\n");
  const totalLines = allLines.length;
  const visible = allLines.slice(scrollOffset, scrollOffset + VISIBLE_LINES);

  return visible.map((line, i) => {
    const lineNum = scrollOffset + i + 1;
    const truncated = line.length > 80 ? line.slice(0, 80) + "…" : line;
    const lineNumStr = String(lineNum).padStart(4);

    if (line.startsWith("+") && !line.startsWith("+++")) {
      return (
        <Box key={i}>
          <Text backgroundColor="green" color="black">
            {lineNumStr}
          </Text>
          <Text> </Text>
          <Text backgroundColor="green" color="black">
            {truncated.padEnd(80)}
          </Text>
        </Box>
      );
    }

    if (line.startsWith("-") && !line.startsWith("---")) {
      return (
        <Box key={i}>
          <Text backgroundColor="red" color="white">
            {lineNumStr}
          </Text>
          <Text> </Text>
          <Text backgroundColor="red" color="white">
            {truncated.padEnd(80)}
          </Text>
        </Box>
      );
    }

    if (line.startsWith("@@")) {
      const short = line.length > 40 ? line.slice(0, 40) + "…" : line;
      return (
        <Box key={i}>
          <Text color="gray">{lineNumStr}</Text>
          <Text> </Text>
          <Text color="cyan" dimColor>
            {short}
          </Text>
        </Box>
      );
    }

    return (
      <Box key={i}>
        <Text color="gray">{lineNumStr}</Text>
        <Text> </Text>
        <Text color="gray">{truncated}</Text>
      </Box>
    );
  });
}

function fileStatusBadge(status: DiffFile["status"]): {
  label: string;
  color: string;
} {
  switch (status) {
    case "added":
      return { label: "ADDED", color: "green" };
    case "removed":
      return { label: "REMOVED", color: "red" };
    case "modified":
      return { label: "MODIFIED", color: "yellow" };
    case "renamed":
      return { label: "RENAMED", color: "cyan" };
    default:
      return { label: "CHANGED", color: "white" };
  }
}

export default function DiffViewer({
  files,
  loading,
  fileIndex,
  scrollOffset,
}: Props) {
  if (loading) {
    return (
      <Box padding={1}>
        <Text color="yellow">loading diff...</Text>
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Box padding={1}>
        <Text color="gray">no files changed</Text>
      </Box>
    );
  }

  const file = files[fileIndex];
  if (!file) return null;

  const totalLines = file.patch?.split("\n").length ?? 0;
  const canScrollDown = scrollOffset + VISIBLE_LINES < totalLines;
  const canScrollUp = scrollOffset > 0;
  const badge = fileStatusBadge(file.status);

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      {/* file tabs */}
      <Box gap={1} flexWrap="wrap">
        {files.map((f, i) => (
          <Text
            key={i}
            color={i === fileIndex ? "black" : "gray"}
            backgroundColor={i === fileIndex ? "cyan" : undefined}
            bold={i === fileIndex}
          >
            {" "}
            {f.filename.split("/").pop()}{" "}
          </Text>
        ))}
      </Box>

      {/* file header */}
      <Box gap={2} alignItems="center">
        <Text backgroundColor={badge.color} color="black" bold>
          {" "}
          {badge.label}{" "}
        </Text>
        <Text color="white">{file.filename}</Text>
        <Text color="green" bold>
          +{file.additions}
        </Text>
        <Text color="red" bold>
          -{file.deletions}
        </Text>
        <Text color="gray" dimColor>
          {fileIndex + 1}/{files.length} files
        </Text>
      </Box>

      {/* scroll up indicator */}
      {canScrollUp ? (
        <Text color="gray" dimColor>
          {" "}
          ↑ more above
        </Text>
      ) : (
        <Text> </Text>
      )}

      {/* patch lines */}
      <Box flexDirection="column">
        {file.patch ? (
          renderPatch(file.patch, scrollOffset)
        ) : (
          <Text color="gray">binary file or no patch available</Text>
        )}
      </Box>

      {/* scroll down indicator */}
      {canScrollDown ? (
        <Text color="gray" dimColor>
          {" "}
          ↓ {totalLines - scrollOffset - VISIBLE_LINES} more lines below
        </Text>
      ) : (
        <Text> </Text>
      )}
    </Box>
  );
}
