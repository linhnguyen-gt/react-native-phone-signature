import React from 'react';
import { findNodeHandle, Platform, UIManager } from 'react-native';

type CommandAction = 'save' | 'clear';
type Commands = {
  save: () => void;
  clear: () => void;
};

const COMMAND_CLEAR = 1;
const COMMAND_SAVE = 2;

const useSignatureCommands = () => {
  const signatureRef = React.useRef<any>(null);
  const commandsRef = React.useRef<Commands | null>(null);
  const [commands, setCommands] = React.useState<Commands | null>(null);

  const getCommands = React.useCallback(() => {
    const nodeHandle = findNodeHandle(signatureRef.current);
    if (!nodeHandle) return null;

    if (Platform.OS === 'android') {
      return {
        clear: () =>
          UIManager.dispatchViewManagerCommand(nodeHandle, COMMAND_CLEAR, []),
        save: () =>
          UIManager.dispatchViewManagerCommand(nodeHandle, COMMAND_SAVE, []),
      };
    }

    return {
      clear: () =>
        UIManager.dispatchViewManagerCommand(nodeHandle, 'clear', []),
      save: () => UIManager.dispatchViewManagerCommand(nodeHandle, 'save', []),
    };
  }, []);

  const executeCommandWithRetry = React.useCallback(
    async (action: CommandAction, callback?: () => void): Promise<void> => {
      const maxAttempts = 5;
      const retryDelay = 200;

      const getCommandsWithRetry = async (attempts = 0): Promise<void> => {
        const currentCommands =
          commands || commandsRef.current || getCommands();

        if (currentCommands) {
          commandsRef.current = currentCommands;
          setCommands(currentCommands);
          currentCommands[action]();
          callback?.();
          return;
        }

        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return getCommandsWithRetry(attempts + 1);
        }
      };

      await getCommandsWithRetry();
    },
    [commands, getCommands]
  );

  React.useEffect(() => {
    const currentCommands = getCommands();
    if (currentCommands) {
      commandsRef.current = currentCommands;
      setCommands(currentCommands);
    }
  }, [getCommands]);

  return {
    signatureRef,
    executeCommandWithRetry,
  };
};

export default useSignatureCommands;
