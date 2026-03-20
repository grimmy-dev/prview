import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { readConfig } from "./auth/config";
import AuthSetup from "./auth/setup";
import { detectRepo } from "./github/repo";

type AppState = "loading" | "auth" | "list";

export default function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState<{ owner: string; repo: string } | null>(
    null
  );

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
      <Box
        justifyContent="space-between"
        paddingX={1}
        borderStyle="single"
        borderColor="cyan"
      >
        <Text bold color="cyan">
          prview
        </Text>
        <Text color="gray">
          {repo ? `${repo.owner}/${repo.repo}` : "no repo detected"}
        </Text>
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
        </Box>

        {/* right — PR detail */}
        <Box
          flexGrow={1}
          borderStyle="single"
          borderColor="gray"
          flexDirection="column"
          paddingX={1}
        >
          <Text color="gray">select a PR to view details</Text>
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
