import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { readConfig } from "./auth/config";
import AuthSetup from "./auth/setup";
import { detectRepo } from "./github/repo";
import Banner from "./components/banner";
import { usePRs } from "./hooks/usePRs";
import PRList from "./screens/PRList";
import { useKeymap } from "./hooks/useKeymap";
import PRDetail from "./screens/PRDetail";
import { useDiff } from "./hooks/useDiff";
import DiffViewer from "./screens/DiffViewer";
import ReviewScreen from "./screens/ReviewScreen";

type AppState = "loading" | "auth" | "list" | "error";
type Screen = "list" | "diff" | "review" | "error";
const VISIBLE_LINES = 15;

export default function App() {
  const [fileIndex, setFileIndex] = useState(0);
  const [appState, setAppState] = useState<AppState>("loading");
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState<{ owner: string; repo: string } | null>(
    null
  );
  const [screen, setScreen] = useState<Screen>("list");
  const [reviewMode, setReviewMode] = useState<"approve" | "reject">("approve");
  const { prs, loading, error } = usePRs(
    token,
    repo?.owner ?? "",
    repo?.repo ?? ""
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedPR = prs[selectedIndex] ?? null;
  const { files, loading: diffLoading } = useDiff(
    token,
    repo?.owner ?? "",
    repo?.repo ?? "",
    screen === "diff" ? selectedPR?.number ?? null : null
  );
  useKeymap({
    onUp: () => {
      if (screen === "list") setSelectedIndex((i) => Math.max(0, i - 1));
      if (screen === "diff") setScrollOffset((s) => Math.max(0, s - 1));
    },
    onDown: () => {
      if (screen === "list")
        setSelectedIndex((i) => Math.min(prs.length - 1, i + 1));
      if (screen === "diff") setScrollOffset((s) => s + 1);
    },
    onLeft: () => {
      if (screen === "diff") {
        setFileIndex((i) => Math.max(0, i - 1));
        setScrollOffset(0);
      }
    },
    onRight: () => {
      if (screen === "diff") {
        setFileIndex((i) => Math.min(files.length - 1, i + 1));
        setScrollOffset(0);
      }
    },
    onSelect: () => {
      if (screen === "list") {
        setScreen("diff");
        setFileIndex(0);
        setScrollOffset(0);
      }
    },
    onBack: () => {
      if (screen === "diff") {
        setScreen("list");
        setScrollOffset(0);
      }
      if (screen === "review") {
        setScreen("list");
      }
    },
    onScrollUp: () => {
      if (screen === "diff") setScrollOffset((s) => Math.max(0, s - 1));
    },
    onScrollDown: () => {
      if (screen === "diff") {
        const currentFile = files[fileIndex];
        if (!currentFile) return;
        const totalLines = currentFile.patch?.split("\n").length ?? 0;
        setScrollOffset((s) =>
          Math.min(s + 1, Math.max(0, totalLines - VISIBLE_LINES))
        );
      }
    },
    onApprove: () => {
      if (screen === "list" || screen === "diff") {
        setReviewMode("approve");
        setScreen("review");
      }
    },
    onReject: () => {
      if (screen === "list" || screen === "diff") {
        setReviewMode("reject");
        setScreen("review");
      }
    },
    onQuit: () => process.exit(0),
  });

  useEffect(() => {
    const config = readConfig();
    if (config) {
      setToken(config.token);
      detectRepo().then((r) => {
        if (!r) {
          setErrorMessage(
            "no github repo detected. run prview inside a git repo with a github remote."
          );
          setAppState("error");
          return;
        }
        setRepo(r);
        setAppState("list");
      });
    } else {
      setAppState("auth");
    }
  }, []);

  if (appState === "loading") {
    return <Text color="gray">loading...</Text>;
  }

  if (appState === "error") {
    return (
      <Box flexDirection="column" padding={2} gap={1}>
        <Text bold color="red">
          ✗ error
        </Text>
        <Text color="gray">────────────────────────────</Text>
        <Text color="white">{errorMessage}</Text>
        <Text color="gray" dimColor>
          press q to quit
        </Text>
      </Box>
    );
  }

  if (appState === "auth") {
    return (
      <AuthSetup
        onSuccess={(t) => {
          setToken(t);
          setAppState("list");
        }}
      />
    );
  }

  return (
    <Box flexDirection="column" height={process.stdout.rows}>
      {/* header */}
      <Box
        paddingX={1}
        justifyContent="flex-start"
        alignItems="flex-start"
        flexDirection="column"
      >
        <Banner />
        <Box
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          gap={1}
        >
          <Text color="gray">
            {repo ? `${repo.owner}/${repo.repo}` : "no repo detected"}
          </Text>
          <Text color="gray">v0.0.1</Text>
        </Box>
      </Box>

      {/* main panels */}
      <Box flexDirection="row" flexGrow={1} overflow="hidden">
        {/* left — PR list */}
        <Box
          width="30%"
          borderStyle="single"
          borderColor="gray"
          flexDirection="column"
          paddingX={1}
          overflow="hidden"
        >
          <Text bold color="white">
            OPEN PRS
          </Text>
          <PRList
            prs={prs}
            loading={loading}
            error={error}
            selectedIndex={selectedIndex}
          />
        </Box>

        {/* right — detail or diff */}
        <Box
          flexGrow={1}
          borderStyle="single"
          borderColor={screen === "diff" ? "cyan" : "gray"}
          flexDirection="column"
          overflow="hidden"
        >
          {screen === "review" ? (
            <ReviewScreen
              token={token}
              owner={repo?.owner ?? ""}
              repo={repo?.repo ?? ""}
              prNumber={selectedPR?.number ?? 0}
              mode={reviewMode}
              onSuccess={() => setScreen("list")}
              onCancel={() => setScreen("list")}
            />
          ) : screen === "diff" ? (
            <DiffViewer
              files={files}
              loading={diffLoading}
              fileIndex={fileIndex}
              scrollOffset={scrollOffset}
            />
          ) : (
            <PRDetail pr={selectedPR} />
          )}
        </Box>
      </Box>

      {/* footer */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="gray">
          {screen === "diff"
            ? "[←→] switch files  [j/k] scroll  [esc] back  [a] approve  [r] reject  [q] quit"
            : "[↑↓] navigate  [enter] open  [a] approve  [r] reject  [q] quit"}
        </Text>
      </Box>
    </Box>
  );
}
