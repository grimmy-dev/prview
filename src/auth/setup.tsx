import { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { validateToken } from "../github/client.ts";
import { writeConfig } from "./config.ts";

interface Props {
  onSuccess: (token: string) => void;
}

type State = "input" | "validating" | "error";

export default function AuthSetup({ onSuccess }: Props) {
  const [token, setToken] = useState("");
  const [state, setState] = useState<State>("input");
  const [error, setError] = useState("");

  async function handleSubmit(value: string) {
    if (!value.trim()) return;
    setState("validating");
    try {
      const user = await validateToken(value.trim());
      writeConfig({ token: value.trim() });
      onSuccess(value.trim());
    } catch {
      setError("invalid token or no network. try again.");
      setState("error");
    }
  }

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <Text bold color="cyan">
        welcome to prview
      </Text>
      <Text color="gray">──────────────────────────────</Text>

      <Text>generate a token at:</Text>
      <Text color="cyan">github.com/settings/tokens</Text>
      <Text color="gray">
        required scope: <Text color="white">repo</Text>
      </Text>

      <Box gap={1} marginTop={1}>
        <Text>paste your token: </Text>
        {state === "validating" ? (
          <Text color="yellow">validating...</Text>
        ) : (
          <TextInput
            value={token}
            onChange={setToken}
            onSubmit={handleSubmit}
            mask="*"
          />
        )}
      </Box>

      {state === "error" && <Text color="red">{error}</Text>}
    </Box>
  );
}
