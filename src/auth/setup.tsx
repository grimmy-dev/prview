import React, { useState } from "react";
import { Box, Text } from "ink";
import { useInput } from "ink";
import TextInput from "ink-text-input";
import open from "open";
import figlet from "figlet";
import { validateToken } from "../github/client.ts";
import { writeConfig } from "./config.ts";

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

interface Props {
  onSuccess: (token: string) => void;
}

type State = "intro" | "input" | "validating" | "error";

export default function AuthSetup({ onSuccess }: Props) {
  const [token, setToken] = useState("");
  const [state, setState] = useState<State>("intro");
  const [error, setError] = useState("");

  useInput((input) => {
    if (state === "intro") {
      if (input === "o") {
        open(
          "https://github.com/settings/tokens/new?scopes=repo&description=prview"
        );
      }
      if (input === "p") {
        setState("input");
      }
      if (input === "q") process.exit(0);
    }
    if (state === "error") {
      if (input === "q") process.exit(0);
    }
  });

  async function handleSubmit(value: string) {
    if (!value.trim()) return;
    setState("validating");
    try {
      await validateToken(value.trim());
      writeConfig({ token: value.trim() });
      onSuccess(value.trim());
    } catch {
      setError("invalid token or no network. try again.");
      setState("error");
    }
  }

  return (
    <Box flexDirection="column" alignItems="center" paddingY={2} gap={1}>
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

      {/* instructions */}
      <Box flexDirection="column" alignItems="center" gap={1}>
        <Text color="white">generate a personal access token at</Text>
        <Text color="cyan">github.com/settings/tokens</Text>
        <Box gap={2}>
          <Text color="gray">required scope:</Text>
          <Text color="white" bold>
            repo
          </Text>
        </Box>
      </Box>

      <Text color="gray">─────────────────────────────────────────</Text>

      {/* step based input */}
      <Box flexDirection="column" alignItems="center" gap={1}>
        {state === "intro" && (
          <Box flexDirection="column" alignItems="center" gap={1}>
            <Text color="gray" dimColor>
              what would you like to do?
            </Text>
            <Box gap={4} marginTop={1}>
              <Box gap={1}>
                <Text color="cyan" bold>
                  [o]
                </Text>
                <Text color="gray">open github to generate token</Text>
              </Box>
              <Box gap={1}>
                <Text color="cyan" bold>
                  [p]
                </Text>
                <Text color="gray">paste token</Text>
              </Box>
              <Box gap={1}>
                <Text color="cyan" bold>
                  [q]
                </Text>
                <Text color="gray">quit</Text>
              </Box>
            </Box>
          </Box>
        )}

        {(state === "input" || state === "error") && (
          <Box flexDirection="column" alignItems="center" gap={1}>
            <Box gap={2}>
              <Text color="gray">paste token:</Text>
              <TextInput
                value={token}
                onChange={(val) => {
                  setToken(val);
                  if (state === "error") setState("input");
                }}
                onSubmit={handleSubmit}
                mask="*"
              />
            </Box>
            {state === "error" && <Text color="red">✗ {error}</Text>}
            <Text color="gray" dimColor>
              press enter to submit
            </Text>
          </Box>
        )}

        {state === "validating" && (
          <Text color="yellow">validating token...</Text>
        )}
      </Box>

      <Text color="gray">─────────────────────────────────────────</Text>
      <Text color="gray" dimColor>
        token stored at ~/.prview/config.json
      </Text>
    </Box>
  );
}
