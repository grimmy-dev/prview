import { useState, useEffect } from "react";
import { getPRs } from "../github/client.ts";
import type { PR } from "../github/types.ts";

interface UsePRsResult {
  prs: PR[];
  loading: boolean;
  error: string | null;
}

export function usePRs(
  token: string,
  owner: string,
  repo: string
): UsePRsResult {
  const [prs, setPRs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !owner || !repo) return;
    setLoading(true);
    getPRs(token, owner, repo)
      .then((data) => {
        setPRs(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.message.includes("401")) {
          setError(
            "invalid token. delete ~/.prview/config.json and run prview again."
          );
        } else if (err.message.includes("404")) {
          setError("repo not found. check your github remote.");
        } else if (err.message.includes("403")) {
          setError("access forbidden. check your token has repo scope.");
        } else {
          setError(err.message);
        }
        setLoading(false);
      });
  }, [token, owner, repo]);

  return { prs, loading, error };
}
