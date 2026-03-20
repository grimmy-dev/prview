import React from "react";
import { Box, Text } from "ink";
import type { DiffFile } from "../github/types.ts";

interface Props {
  files: DiffFile[];
  loading: boolean;
  fileIndex: number;
  scrollOffset: number;
}

const VISIBLE_LINES = 15;

function renderPatch(patch: string, scrollOffset: number) {
  const allLines = patch.split("\n");
  const visible = allLines.slice(scrollOffset, scrollOffset + VISIBLE_LINES);

  return visible.map((line, i) => {
    const lineNum = scrollOffset + i + 1;
    const truncated = line.length > 80 ? line.slice(0, 80) + "…" : line;

    if (line.startsWith("+") && !line.startsWith("+++")) {
      return (
        <Box key={i}>
          <Text color="gray">{String(lineNum).padStart(4)} </Text>
          <Text color="green">{truncated}</Text>
        </Box>
      );
    }
    if (line.startsWith("-") && !line.startsWith("---")) {
      return (
        <Box key={i}>
          <Text color="gray">{String(lineNum).padStart(4)} </Text>
          <Text color="red">{truncated}</Text>
        </Box>
      );
    }
    if (line.startsWith("@@")) {
      const truncated = line.length > 40 ? line.slice(0, 40) + "…" : line;
      return (
        <Box key={i}>
          <Text color="gray">{String(lineNum).padStart(4)} </Text>
          <Text color="cyan">{truncated}</Text>
        </Box>
      );
    }
    return (
      <Box key={i}>
        <Text color="gray">{String(lineNum).padStart(4)} </Text>
        <Text color="gray">{truncated}</Text>
      </Box>
    );
  });
}

function fileStatusColor(status: DiffFile["status"]): string {
  switch (status) {
    case "added":
      return "green";
    case "removed":
      return "red";
    case "modified":
      return "yellow";
    case "renamed":
      return "cyan";
    default:
      return "white";
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

  return (
    <Box flexDirection="column" padding={1}>
      {/* file tabs */}
      <Box gap={1} marginBottom={1} flexWrap="wrap">
        {files.map((f, i) => (
          <Box key={i}>
            <Text
              color={i === fileIndex ? "cyan" : "gray"}
              bold={i === fileIndex}
            >
              {i === fileIndex ? "[ " : "  "}
              {f.filename.split("/").pop()}
              {i === fileIndex ? " ]" : "  "}
            </Text>
          </Box>
        ))}
      </Box>

      {/* file header */}
      <Box
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        marginBottom={1}
        gap={2}
      >
        <Text color={fileStatusColor(file.status)} bold>
          {file.status.toUpperCase()}
        </Text>
        <Text color="white">{file.filename}</Text>
        <Text color="green">+{file.additions}</Text>
        <Text color="red">-{file.deletions}</Text>
        <Text color="gray">
          {fileIndex + 1}/{files.length} files
        </Text>
      </Box>

      {/* scroll indicator top */}
      {canScrollUp && (
        <Text color="gray" dimColor>
          {" "}
          ↑ more above
        </Text>
      )}

      {/* patch */}
      <Box flexDirection="column">
        {file.patch ? (
          renderPatch(file.patch, scrollOffset)
        ) : (
          <Text color="gray">binary file or no patch available</Text>
        )}
      </Box>

      {/* scroll indicator bottom */}
      {canScrollDown && (
        <Text color="gray" dimColor>
          {" "}
          ↓ more below ({totalLines - scrollOffset - VISIBLE_LINES} lines)
        </Text>
      )}
    </Box>
  );
}
