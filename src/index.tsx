import React, { useState, useEffect } from "react";
import { render } from "ink";
import { Box, Text } from "ink";
import App from "./app.tsx";
import Splash from "./screens/Splash.tsx";
import { existsSync, rmSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const args = process.argv.slice(2);

if (args[0] === "uninstall") {
  const configDir = join(homedir(), ".prview");
  if (existsSync(configDir)) {
    rmSync(configDir, { recursive: true, force: true });
    console.log("✓ prview config removed from ~/.prview");
  } else {
    console.log("nothing to remove — ~/.prview does not exist");
  }
  process.exit(0);
}

if (args[0] === "--help" || args[0] === "-h") {
  // ... existing help render
} else {
  function Root() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setReady(true), 1500);
      return () => clearTimeout(timer);
    }, []);

    return ready ? <App /> : <Splash />;
  }

  render(<Root />);
}
