import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import figlet from "figlet";

const banner = figlet.textSync("prview", { font: "ANSI Shadow" });
const lines = banner.split("\n").filter((line) => line.trim() !== "");
const colors = [
  "#00FF94",
  "#00F080",
  "#00DC6E",
  "#00C85C",
  "#00B44A",
  "#00A038",
];

export default function Splash() {
  const [show, setShow] = useState(true);

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={2}
      gap={1}
    >
      {/* banner */}
      <Box flexDirection="column" alignItems="center">
        {lines.map((line, i) => (
          <Text key={i} color={colors[i % colors.length]}>
            {line}
          </Text>
        ))}
      </Box>

      <Text color="gray">terminal UI for GitHub PR reviews</Text>
      <Text color="gray">─────────────────────────────────────────</Text>

      {/* quick ref */}
      <Box flexDirection="column" alignItems="center" gap={1}>
        <Text bold color="white">
          quick reference
        </Text>
        <Box gap={4}>
          <Text color="cyan">[↑↓]</Text>
          <Text color="gray">navigate</Text>
          <Text color="cyan">[enter]</Text>
          <Text color="gray">open diff</Text>
          <Text color="cyan">[←→/jk]</Text>
          <Text color="gray">switch files</Text>
          <Text color="cyan">[v]</Text>
          <Text color="gray">full file</Text>
        </Box>
        <Box gap={4}>
          <Text color="cyan">[a]</Text>
          <Text color="gray">approve</Text>
          <Text color="cyan">[r]</Text>
          <Text color="gray">request changes</Text>
          <Text color="cyan">[esc]</Text>
          <Text color="gray">back</Text>
          <Text color="cyan">[q]</Text>
          <Text color="gray">quit</Text>
        </Box>
      </Box>

      <Text color="gray">─────────────────────────────────────────</Text>
      <Box gap={2}>
        <Text color="gray">
          token: <Text color="white">~/.prview/config.json</Text>
        </Text>
        <Text color="gray">
          scope: <Text color="white">repo</Text>
        </Text>
        <Text color="gray">
          help: <Text color="cyan">prview --help</Text>
        </Text>
      </Box>

      <Text color="gray" dimColor>
        loading...
      </Text>
    </Box>
  );
}
