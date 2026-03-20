import React from "react";
import { Box, Text } from "ink";
import figlet from "figlet";

const banner = figlet.textSync("prview", {
  font: "ANSI Shadow",
});

const lines = banner.split("\n");

const colors = [
  "#00C853",
  "#00FF87",
  "#00E676",
  "#69F0AE",
  "#00BFA5",
  "#1DE9B6",
];

export default function Banner() {
  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      {lines.map((line, i) => (
        <Text key={i} color={colors[i % colors.length]}>
          {line}
        </Text>
      ))}
    </Box>
  );
}
