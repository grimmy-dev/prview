export interface GithubUser {
  login: string;
  avatar_url: string;
}

export interface PR {
  number: number;
  title: string;
  user: GithubUser;
  created_at: string;
  head: { ref: string };
  base: { ref: string };
  draft: boolean;
  reviews_count?: number;
  changed_files?: number;
}

export interface DiffFile {
  filename: string;
  status: "added" | "removed" | "modified" | "renamed";
  additions: number;
  deletions: number;
  patch?: string;
}

export interface Review {
  state: "APPROVED" | "REQUEST_CHANGES" | "COMMENT";
  body: string;
}

export interface CIStatus {
  state: "success" | "failure" | "pending" | "none";
}

export interface Comment {
  id: number;
  body: string;
  user: GithubUser;
  created_at: string;
  path?: string;
  line?: number;
}
