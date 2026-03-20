import { useInput, useApp } from "ink";

interface Actions {
  onUp: () => void;
  onDown: () => void;
  onSelect: () => void;
  onQuit: () => void;
}

export function useKeymap(actions: Actions) {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === "q") {
      exit();
      actions.onQuit();
    }
    if (key.upArrow) actions.onUp();
    if (key.downArrow) actions.onDown();
    if (key.return) actions.onSelect();
  });
}
