import { useState, useEffect } from "react";
import { getFileContent } from "../github/client.ts";

interface UseFileContentResult {
  content: string | null;
  loading: boolean;
  error: string | null;
}

export function useFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string | null,
  ref: string | null
): UseFileContentResult {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !owner || !repo || !path || !ref) return;
    setLoading(true);
    setContent(null);
    getFileContent(token, owner, repo, path, ref)
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, owner, repo, path, ref]);

  return { content, loading, error };
}
