import simpleGit from "simple-git";

interface RepoInfo {
  owner: string;
  repo: string;
}

export async function detectRepo(): Promise<RepoInfo | null> {
  try {
    const git = simpleGit(process.cwd());
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === "origin");
    if (!origin) return null;

    const url = origin.refs.fetch;
    const match = url.match(/github\.com[:/](.+?)\/(.+?)(?:\.git)?$/);
    if (!match) return null;

    return {
      owner: match[1] ?? "",
      repo: match[2] ?? "",
    };
  } catch {
    return null;
  }
}
