import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { submitReview } from "../github/client.ts";

interface Props {
  token: string;
  owner: string;
  repo: string;
  prNumber: number;
  mode: "approve" | "reject";
  onSuccess: () => void;
  onCancel: () => void;
}

type State = "input" | "submitting" | "done" | "error";

export default function ReviewScreen({
  token,
  owner,
  repo,
  prNumber,
  mode,
  onSuccess,
  onCancel,
}: Props) {
  const [comment, setComment] = useState("");
  const [state, setState] = useState<State>("input");
  const [error, setError] = useState("");

  async function handleSubmit(value: string) {
    setState("submitting");
    try {
      await submitReview(
        token,
        owner,
        repo,
        prNumber,
        mode === "approve" ? "APPROVE" : "REQUEST_CHANGES",
        value
      );
      setState("done");
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
      setState("error");
    }
  }

  const color = mode === "approve" ? "green" : "red";
  const label = mode === "approve" ? "APPROVE" : "REQUEST CHANGES";

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <Text bold color={color}>
        {label} — PR #{prNumber}
      </Text>
      <Text color="gray">────────────────────────────</Text>

      {state === "input" && (
        <Box flexDirection="column" gap={1}>
          <Text color="gray">
            add a comment{" "}
            <Text dimColor>(optional, press enter to submit)</Text>
          </Text>
          <Box gap={1}>
            <Text color="gray">{">"} </Text>
            <TextInput
              value={comment}
              onChange={setComment}
              onSubmit={handleSubmit}
              placeholder="leave a comment..."
            />
          </Box>
          <Text color="gray" dimColor>
            [esc] cancel
          </Text>
        </Box>
      )}

      {state === "submitting" && (
        <Text color="yellow">submitting review...</Text>
      )}

      {state === "done" && (
        <Text color={color}>
          {mode === "approve" ? "✓ approved!" : "✓ changes requested!"}
        </Text>
      )}

      {state === "error" && <Text color="red">error: {error}</Text>}
    </Box>
  );
}
