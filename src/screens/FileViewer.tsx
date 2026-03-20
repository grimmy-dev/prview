import React from "react";
import { Box, Text } from "ink";
import { highlight } from "cli-highlight";
import { extname } from "path";

interface Props {
  content: string | null;
  loading: boolean;
  filename: string;
  scrollOffset: number;
  patch?: string;
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

function getChangedLines(patch: string): {
  added: Set<number>;
  removed: Set<number>;
} {
  const added = new Set<number>();
  const removed = new Set<number>();
  let currentLine = 0;

  for (const line of patch.split("\n")) {
    if (line.startsWith("@@")) {
      const match = line.match(/@@ \-\d+(?:,\d+)? \+(\d+)/);
      if (match?.[1]) currentLine = parseInt(match[1]) - 1;
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      currentLine++;
      added.add(currentLine);
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      removed.add(currentLine);
    } else if (!line.startsWith("\\")) {
      currentLine++;
    }
  }

  return { added, removed };
}

export default function FileViewer({
  content,
  loading,
  filename,
  scrollOffset,
  patch,
  visibleLines,
  maxLineWidth,
}: Props) {
  if (loading) {
    return (
      <Box padding={1}>
        <Text color="yellow">loading file...</Text>
      </Box>
    );
  }

  if (!content) {
    return (
      <Box padding={1}>
        <Text color="gray">no content available</Text>
      </Box>
    );
  }

  const allLines = content.split("\n");
  const totalLines = allLines.length;
  const visible = allLines.slice(scrollOffset, scrollOffset + visibleLines);
  const canScrollUp = scrollOffset > 0;
  const canScrollDown = scrollOffset + visibleLines < totalLines;
  const { added, removed } = patch
    ? getChangedLines(patch)
    : { added: new Set<number>(), removed: new Set<number>() };

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      {/* header */}
      <Box gap={2}>
        <Text backgroundColor="cyan" color="black" bold>
          {" "}
          FILE{" "}
        </Text>
        <Text color="white">{filename}</Text>
        <Text color="gray" dimColor>
          {totalLines} lines
        </Text>
      </Box>

      {/* scroll up */}
      {canScrollUp ? (
        <Text color="gray" dimColor>
          {" "}
          ↑ more above
        </Text>
      ) : (
        <Text> </Text>
      )}

      {/* lines */}
      <Box flexDirection="column">
        {visible.map((line, i) => {
          const lineNum = scrollOffset + i + 1;
          const lineNumStr = String(lineNum).padStart(4);
          const truncated =
            line.length > maxLineWidth
              ? line.slice(0, maxLineWidth) + "…"
              : line;
          const isAdded = added.has(lineNum);
          const isRemoved = removed.has(lineNum);

          if (isAdded) {
            return (
              <Box key={i}>
                <Text backgroundColor="#1a4d2e" color="#4ade80">
                  {lineNumStr} +
                </Text>
                <Text backgroundColor="#1a4d2e" color="#86efac" wrap="truncate">
                  {truncated.padEnd(maxLineWidth)}
                </Text>
              </Box>
            );
          }

          if (isRemoved) {
            return (
              <Box key={i}>
                <Text backgroundColor="#4d1a1a" color="#f87171">
                  {lineNumStr} -
                </Text>
                <Text backgroundColor="#4d1a1a" color="#fca5a5" wrap="truncate">
                  {truncated.padEnd(maxLineWidth)}
                </Text>
              </Box>
            );
          }

          const highlighted = highlightLine(truncated, filename);
          return (
            <Box key={i}>
              <Text color="gray">{lineNumStr} </Text>
              <Text wrap="truncate">{highlighted}</Text>
            </Box>
          );
        })}
      </Box>

      {/* scroll down */}
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
