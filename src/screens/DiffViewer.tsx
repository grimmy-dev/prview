import React from "react";
import { Box, Text } from "ink";
import { highlight } from "cli-highlight";
import { extname } from "path";
import type { DiffFile } from "../github/types.ts";

interface Props {
  files: DiffFile[];
  loading: boolean;
  fileIndex: number;
  scrollOffset: number;
  visibleLines: number;
  maxLineWidth: number;
}

function getLanguage(filename: string): string | undefined {
  const ext = extname(filename).slice(1);
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    cs: "csharp",
    cpp: "cpp",
    c: "c",
    md: "markdown",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    sh: "bash",
    css: "css",
    html: "html",
  };
  return map[ext];
}

function highlightLine(line: string, filename: string): string {
  const lang = getLanguage(filename);
  if (!lang) return line;
  try {
    return highlight(line, {
      language: lang,
      ignoreIllegals: true,
      theme: {
        keyword: (s) => `\x1b[35m${s}\x1b[0m`,
        string: (s) => `\x1b[33m${s}\x1b[0m`,
        comment: (s) => `\x1b[90m${s}\x1b[0m`,
        number: (s) => `\x1b[36m${s}\x1b[0m`,
        function: (s) => `\x1b[34m${s}\x1b[0m`,
      },
    });
  } catch {
    return line;
  }
}

function renderPatch(
  patch: string,
  scrollOffset: number,
  visibleLines: number,
  filename: string,
  maxLineWidth: number
) {
  const allLines = patch.split("\n");
  const visible = allLines.slice(scrollOffset, scrollOffset + visibleLines);

  return visible.map((line, i) => {
    const lineNum = scrollOffset + i + 1;
    const lineNumStr = String(lineNum).padStart(4);
    const content =
      line.length > maxLineWidth ? line.slice(0, maxLineWidth) + "…" : line;

    if (line.startsWith("+") && !line.startsWith("+++")) {
      const code = content.slice(1);
      return (
        <Box key={i}>
          <Text backgroundColor="#1a4d2e" color="#4ade80">
            {lineNumStr} +
          </Text>
          <Text backgroundColor="#1a4d2e" color="#86efac" wrap="truncate">
            {code.padEnd(maxLineWidth)}
          </Text>
        </Box>
      );
    }

    if (line.startsWith("-") && !line.startsWith("---")) {
      const code = content.slice(1);
      return (
        <Box key={i}>
          <Text backgroundColor="#4d1a1a" color="#f87171">
            {lineNumStr} -
          </Text>
          <Text backgroundColor="#4d1a1a" color="#fca5a5" wrap="truncate">
            {code.padEnd(maxLineWidth)}
          </Text>
        </Box>
      );
    }

    if (line.startsWith("@@")) {
      const short = line.length > 40 ? line.slice(0, 40) + "…" : line;
      return (
        <Box key={i}>
          <Text color="gray">{lineNumStr} </Text>
          <Text color="cyan" dimColor wrap="truncate">
            {short}
          </Text>
        </Box>
      );
    }

    const highlighted = highlightLine(content, filename);
    return (
      <Box key={i}>
        <Text color="gray">{lineNumStr} </Text>
        <Text wrap="truncate">{highlighted}</Text>
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
  visibleLines,
  maxLineWidth,
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
  const canScrollDown = scrollOffset + visibleLines < totalLines;
  const canScrollUp = scrollOffset > 0;
  const badge = fileStatusBadge(file.status);

  return (
    <Box flexDirection="column" padding={1} gap={1}>
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
          renderPatch(
            file.patch,
            scrollOffset,
            visibleLines,
            file.filename,
            maxLineWidth
          )
        ) : (
          <Text color="gray">binary file or no patch available</Text>
        )}
      </Box>

      {/* scroll down indicator */}
      {canScrollDown ? (
        <Text color="gray" dimColor>
          {" "}
          ↓ {totalLines - scrollOffset - visibleLines} more lines below
        </Text>
      ) : (
        <Text> </Text>
      )}
    </Box>
  );
}
