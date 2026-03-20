import React from "react";
import { Box, Text } from "ink";
import figlet from "figlet";

const banner = figlet.textSync("prview", {
  font: "ANSI Shadow",
});

const lines = banner.split("\n").filter((line) => line.trim() !== "");

const colors = [
  "#00FF94",
  "#00F080",
  "#00DC6E",
  "#00C85C",
  "#00B44A",
  "#00A038",
];

export default function Banner() {
  return (
    <Box flexDirection="column" alignItems="flex-start">
      {lines.map((line, i) => (
        <Text key={i} color={colors[i % colors.length]}>
          {line}
        </Text>
      ))}
    </Box>
  );
}
