import { useInput, useApp } from "ink";
interface Actions {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onScrollUp: () => void;
  onScrollDown: () => void;
  onSelect: () => void;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  onViewFile: () => void;
  onComment: () => void;
  onQuit: () => void;
}

export function useKeymap(actions: Actions) {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === "q") {
      exit();
      actions.onQuit();
    }
    if (input === "a") actions.onApprove();
    if (input === "r") actions.onReject();
    if (input === "j") actions.onScrollDown();
    if (input === "k") actions.onScrollUp();
    if (input === "v") actions.onViewFile();
    if (input === "c") actions.onComment();
    if (key.upArrow) actions.onUp();
    if (key.downArrow) actions.onDown();
    if (key.leftArrow) actions.onLeft();
    if (key.rightArrow) actions.onRight();
    if (key.return) actions.onSelect();
    if (key.escape) actions.onBack();
  });
}
