import React from 'react';
import { findNodeHandle, UIManager } from 'react-native';

type CommandAction = 'save' | 'clear';
type Commands = {
  save: () => void;
  clear: () => void;
};

const useSignatureCommands = () => {
  const signatureRef = React.useRef<any>(null);
  const commandsRef = React.useRef<Commands | null>(null);
  const [commands, setCommands] = React.useState<Commands | null>(null);

  const getCommands = React.useCallback(() => {
    if (signatureRef.current) {
      const nodeHandle = findNodeHandle(signatureRef.current);
      if (!nodeHandle) {
        commandsRef.current = null;
        setCommands(null);
        return null;
      }

      const newCommands = {
        clear: () =>
          UIManager.dispatchViewManagerCommand(nodeHandle, 'clear', []),
        save: () =>
          UIManager.dispatchViewManagerCommand(nodeHandle, 'save', []),
      };

      commandsRef.current = newCommands;
      setCommands(newCommands);
      return newCommands;
    }
    return null;
  }, []);

  const executeCommandWithRetry = React.useCallback(
    async (action: CommandAction, callback?: () => void): Promise<void> => {
      const maxAttempts = 5;
      const retryDelay = 200;

      const getCommandsWithRetry = async (attempts = 0): Promise<void> => {
        const currentCommands =
          attempts === 0
            ? getCommands()
            : commands || commandsRef.current || getCommands();

        if (currentCommands) {
          currentCommands[action]();
          callback?.();
          return;
        }

        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return getCommandsWithRetry(attempts + 1);
        }

        console.warn('Failed to execute command after max attempts');
      };

      await getCommandsWithRetry();
    },
    [commands, getCommands]
  );

  React.useEffect(() => {
    getCommands();

    return () => {
      commandsRef.current = null;
      setCommands(null);
    };
  }, [getCommands]);

  return {
    signatureRef,
    executeCommandWithRetry,
  };
};

export default useSignatureCommands;
