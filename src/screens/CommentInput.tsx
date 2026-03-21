import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { submitLineComment } from "../github/client.ts";

interface Props {
  token: string;
  owner: string;
  repo: string;
  prNumber: number;
  commitId: string;
  path: string;
  line: number;
  onSuccess: () => void;
  onCancel: () => void;
}

type State = "input" | "submitting" | "done" | "error";

export default function CommentInput({
  token,
  owner,
  repo,
  prNumber,
  commitId,
  path,
  line,
  onSuccess,
  onCancel,
}: Props) {
  const [comment, setComment] = useState("");
  const [state, setState] = useState<State>("input");
  const [error, setError] = useState("");

  async function handleSubmit(value: string) {
    if (!value.trim()) {
      onCancel();
      return;
    }
    setState("submitting");
    try {
      await submitLineComment(
        token,
        owner,
        repo,
        prNumber,
        value.trim(),
        commitId,
        path,
        line
      );
      setState("done");
      setTimeout(() => onSuccess(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
      setState("error");
    }
  }

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Box gap={2}>
        <Text backgroundColor="cyan" color="black" bold>
          {" "}
          COMMENT{" "}
        </Text>
        <Text color="gray">{path}</Text>
        <Text color="gray">
          line <Text color="white">{line}</Text>
        </Text>
      </Box>

      <Text color="gray">─────────────────────────────────────</Text>

      {state === "input" && (
        <Box flexDirection="column" gap={1}>
          <Box gap={2}>
            <Text color="gray">{">"}</Text>
            <TextInput
              value={comment}
              onChange={setComment}
              onSubmit={handleSubmit}
              placeholder="type comment, enter to submit, empty to cancel..."
            />
          </Box>
          <Text color="gray" dimColor>
            [enter] submit [esc] cancel
          </Text>
        </Box>
      )}

      {state === "submitting" && <Text color="yellow">posting comment...</Text>}

      {state === "done" && <Text color="green">✓ comment posted</Text>}

      {state === "error" && <Text color="red">✗ {error}</Text>}
    </Box>
  );
}
