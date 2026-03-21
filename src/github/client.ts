import type { PR, DiffFile, GithubUser, CIStatus, Comment } from "./types.ts";

const BASE = "https://api.github.com";

async function request<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function validateToken(token: string): Promise<GithubUser> {
  return request<GithubUser>("/user", token);
}

export async function getPRs(
  token: string,
  owner: string,
  repo: string
): Promise<PR[]> {
  return request<PR[]>(
    `/repos/${owner}/${repo}/pulls?state=open&per_page=50`,
    token
  );
}

export async function getPR(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
): Promise<PR> {
  return request<PR>(`/repos/${owner}/${repo}/pulls/${prNumber}`, token);
}

export async function getPRFiles(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
): Promise<DiffFile[]> {
  return request<DiffFile[]>(
    `/repos/${owner}/${repo}/pulls/${prNumber}/files`,
    token
  );
}

export async function getCIStatus(
  token: string,
  owner: string,
  repo: string,
  ref: string
): Promise<CIStatus> {
  const data = await request<{ state: CIStatus["state"] }>(
    `/repos/${owner}/${repo}/commits/${ref}/status`,
    token
  );
  return { state: data.state ?? "none" };
}

export async function submitReview(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  event: "APPROVE" | "REQUEST_CHANGES",
  body: string
): Promise<void> {
  await request(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, token, {
    method: "POST",
    body: JSON.stringify({ event, body }),
  });
}

export async function getPRComments(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
): Promise<Comment[]> {
  return request<Comment[]>(
    `/repos/${owner}/${repo}/pulls/${prNumber}/comments`,
    token
  );
}

export async function getFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<string> {
  const data = await request<{ content: string; encoding: string }>(
    `/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
    token
  );
  if (data.encoding === "base64") {
    return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString(
      "utf-8"
    );
  }
  return data.content;
}

export async function submitLineComment(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
  commitId: string,
  path: string,
  line: number
): Promise<void> {
  await request(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`, token, {
    method: "POST",
    body: JSON.stringify({
      body,
      commit_id: commitId,
      path,
      line,
      side: "RIGHT",
    }),
  });
}
