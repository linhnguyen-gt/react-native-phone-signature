import React from 'react';
import { findNodeHandle, Platform, UIManager } from 'react-native';

const COMMAND_CLEAR = 1;
const COMMAND_SAVE = 2;

const useManagerCommand = (signatureRef: React.MutableRefObject<null>) => {
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
      clear: () => {
        UIManager.dispatchViewManagerCommand(nodeHandle, 'clear', []);
      },
      save: () => UIManager.dispatchViewManagerCommand(nodeHandle, 'save', []),
    };
  }, [signatureRef]);

  return getCommands;
};

export default useManagerCommand;
