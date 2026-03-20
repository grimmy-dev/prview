import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { readConfig } from "./auth/config.ts";
import AuthSetup from "./auth/setup.tsx";
import { detectRepo } from "./github/repo.ts";
import Banner from "./components/banner.tsx";
import { usePRs } from "./hooks/usePRs.ts";
import PRList from "./screens/PRList.tsx";
import { useKeymap } from "./hooks/useKeymap.ts";
import PRDetail from "./screens/PRDetail.tsx";
import { useDiff } from "./hooks/useDiff.ts";
import DiffViewer from "./screens/DiffViewer.tsx";
import ReviewScreen from "./screens/ReviewScreen.tsx";
import { useFileContent } from "./hooks/useFileContent.ts";
import FileViewer from "./screens/FileViewer.tsx";

type AppState = "loading" | "auth" | "list" | "error";
type Screen = "list" | "diff" | "review" | "file";

const HEADER_HEIGHT = 7;
const FOOTER_HEIGHT = 3;

export default function App() {
  const [fileIndex, setFileIndex] = useState(0);
  const [appState, setAppState] = useState<AppState>("loading");
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState<{ owner: string; repo: string } | null>(
    null
  );
  const [screen, setScreen] = useState<Screen>("list");
  const [reviewMode, setReviewMode] = useState<"approve" | "reject">("approve");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [fileScrollOffset, setFileScrollOffset] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [termRows, setTermRows] = useState(process.stdout.rows ?? 24);
  const [termCols, setTermCols] = useState(process.stdout.columns ?? 80);

  const visibleLines = Math.max(5, termRows - HEADER_HEIGHT - FOOTER_HEIGHT);

  const { prs, loading, error } = usePRs(
    token,
    repo?.owner ?? "",
    repo?.repo ?? ""
  );
  const selectedPR = prs[selectedIndex] ?? null;

  const { files, loading: diffLoading } = useDiff(
    token,
    repo?.owner ?? "",
    repo?.repo ?? "",
    screen === "diff" || screen === "file" ? selectedPR?.number ?? null : null
  );

  const currentFile = files[fileIndex] ?? null;

  const { content: fileContent, loading: fileLoading } = useFileContent(
    token,
    repo?.owner ?? "",
    repo?.repo ?? "",
    screen === "file" ? currentFile?.filename ?? null : null,
    screen === "file" ? selectedPR?.head.ref ?? null : null
  );

  useKeymap({
    onUp: () => {
      if (screen === "list") setSelectedIndex((i) => Math.max(0, i - 1));
      if (screen === "diff") setScrollOffset((s) => Math.max(0, s - 1));
      if (screen === "file") setFileScrollOffset((s) => Math.max(0, s - 1));
    },
    onDown: () => {
      if (screen === "list")
        setSelectedIndex((i) => Math.min(prs.length - 1, i + 1));
      if (screen === "diff") {
        const patch = files[fileIndex]?.patch ?? "";
        const totalLines = patch.split("\n").length;
        const maxOffset = Math.max(0, totalLines - visibleLines);
        setScrollOffset((s) => Math.min(s + 1, maxOffset));
      }
      if (screen === "file") {
        const totalLines = fileContent?.split("\n").length ?? 0;
        const maxOffset = Math.max(0, totalLines - visibleLines);
        setFileScrollOffset((s) => Math.min(s + 1, maxOffset));
      }
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
    onScrollUp: () => {
      if (screen === "diff") {
        setFileIndex((i) => Math.max(0, i - 1));
        setScrollOffset(0);
      }
    },
    onScrollDown: () => {
      if (screen === "diff") {
        setFileIndex((i) => Math.min(files.length - 1, i + 1));
        setScrollOffset(0);
      }
    },
    onViewFile: () => {
      if (screen === "diff") {
        setScreen("file");
        setFileScrollOffset(0);
      }
      if (screen === "file") {
        setScreen("diff");
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
      if (screen === "file") {
        setScreen("diff");
        setFileScrollOffset(0);
      }
      if (screen === "review") setScreen("list");
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

  useEffect(() => {
    const handleResize = () => {
      setTermRows(process.stdout.rows ?? 24);
      setTermCols(process.stdout.columns ?? 80);
    };
    process.stdout.on("resize", handleResize);
    return () => {
      process.stdout.off("resize", handleResize);
    };
  }, []);

  const usableCols = Math.floor(termCols * 0.7) - 10;

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
    <Box flexDirection="column" height={termRows}>
      {/* header */}
      <Box
        paddingX={1}
        paddingY={0}
        justifyContent="space-between"
        alignItems="center"
      >
        <Banner />
        <Box flexDirection="column" alignItems="flex-end">
          <Text color="gray">
            {repo ? `${repo.owner}/${repo.repo}` : "no repo detected"}
          </Text>
          <Text color="gray" dimColor>
            v0.0.1
          </Text>
        </Box>
      </Box>

      {/* main panels */}
      <Box flexDirection="row" flexGrow={1} overflow="hidden">
        {/* left panel */}
        <Box
          width="30%"
          borderStyle="single"
          borderColor={screen === "diff" || screen === "file" ? "cyan" : "gray"}
          flexDirection="column"
          paddingX={1}
          overflow="hidden"
        >
          {screen === "diff" || screen === "file" ? (
            <>
              <Text bold color="cyan">
                CHANGED FILES
              </Text>
              <Box flexDirection="column" marginTop={1}>
                {files.map((f, i) => (
                  <Box key={i} gap={1}>
                    <Text color={i === fileIndex ? "cyan" : "gray"}>
                      {i === fileIndex ? "▶" : " "}
                    </Text>
                    <Text color={i === fileIndex ? "white" : "gray"}>
                      {f.filename.split("/").pop()}
                    </Text>
                    <Text color="green" dimColor>
                      +{f.additions}
                    </Text>
                    <Text color="red" dimColor>
                      -{f.deletions}
                    </Text>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <>
              <Text bold color="white">
                OPEN PRS
              </Text>
              <PRList
                prs={prs}
                loading={loading}
                error={error}
                selectedIndex={selectedIndex}
              />
            </>
          )}
        </Box>

        {/* right panel */}
        <Box
          flexGrow={1}
          borderStyle="single"
          borderColor={screen === "diff" || screen === "file" ? "cyan" : "gray"}
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
          ) : screen === "file" ? (
            <FileViewer
              content={fileContent}
              loading={fileLoading}
              filename={currentFile?.filename ?? ""}
              scrollOffset={fileScrollOffset}
              patch={currentFile?.patch}
              visibleLines={visibleLines}
              maxLineWidth={usableCols}
            />
          ) : screen === "diff" ? (
            <DiffViewer
              files={files}
              loading={diffLoading}
              fileIndex={fileIndex}
              scrollOffset={scrollOffset}
              visibleLines={visibleLines}
              maxLineWidth={usableCols}
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
            ? "[↑↓] scroll  [←→/jk] switch files  [v] view file  [esc] back  [a] approve  [r] reject  [q] quit"
            : screen === "file"
            ? "[↑↓] scroll  [v] back to diff  [esc] back  [q] quit"
            : "[↑↓] navigate  [enter] open  [a] approve  [r] reject  [q] quit"}
        </Text>
      </Box>
    </Box>
  );
}
