import { useState, useEffect } from "react";
import { getPRFiles } from "../github/client.ts";
import type { DiffFile } from "../github/types.ts";

interface UseDiffResult {
  files: DiffFile[];
  loading: boolean;
  error: string | null;
}

export function useDiff(
  token: string,
  owner: string,
  repo: string,
  prNumber: number | null
): UseDiffResult {
  const [files, setFiles] = useState<DiffFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !owner || !repo || !prNumber) return;
    setLoading(true);
    setFiles([]);
    getPRFiles(token, owner, repo, prNumber)
      .then((data) => {
        setFiles(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, owner, repo, prNumber]);

  return { files, loading, error };
}
