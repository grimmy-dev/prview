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

type AppState = "loading" | "auth" | "list";

export default function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState<{ owner: string; repo: string } | null>(
    null
  );
  const { prs, loading, error } = usePRs(
    token,
    repo?.owner ?? "",
    repo?.repo ?? ""
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  useKeymap({
    onUp: () => setSelectedIndex((i) => Math.max(0, i - 1)),
    onDown: () => setSelectedIndex((i) => Math.min(prs.length - 1, i + 1)),
    onSelect: () => {},
    onQuit: () => process.exit(0),
  });

  useEffect(() => {
    const config = readConfig();
    if (config) {
      setToken(config.token);
      detectRepo().then((r) => {
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
    <Box flexDirection="column" height={24}>
      {/* header */}
      <Box width={50} flexDirection="column">
        <Banner />
        <Box justifyContent="space-between" paddingX={1}>
          <Text color="gray">
            {repo ? `${repo.owner}/${repo.repo}` : "no repo detected"}
          </Text>
          <Text color="gray">v0.0.1</Text>
        </Box>
      </Box>

      {/* main panels */}
      <Box flexDirection="row" flexGrow={1}>
        {/* left — PR list */}
        <Box
          width="30%"
          borderStyle="single"
          borderColor="gray"
          flexDirection="column"
          paddingX={1}
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

        {/* right — PR detail */}
        <Box
          flexGrow={1}
          borderStyle="single"
          borderColor="gray"
          flexDirection="column"
        >
          <PRDetail pr={prs[selectedIndex] ?? null} />
        </Box>
      </Box>

      {/* footer */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="gray">
          [↑↓] navigate [enter] open [a] approve [r] reject [q] quit
        </Text>
      </Box>
    </Box>
  );
}
