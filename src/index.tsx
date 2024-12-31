import React from 'react';
import {
  Alert,
  requireNativeComponent,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Box, SignatureBottomSheet, SignatureModal } from './component';
import { createFileInfo } from './helper';
import { useSignatureCommands } from './hooks';

export type AssetSignature = {
  path: string;
  uri: string;
  size: number;
  name: string;
  width: number;
  height: number;
};

type SignaturePadProps = {
  onSave?: (file: AssetSignature) => void;
  onClear?: () => void;
  onError?: () => void;
  backgroundColorButton?: string;
  isSaveToLibrary?: boolean;
  lineWidth?: number;
  showBaseline?: boolean;
  signatureColor?: string;
  outputFormat?: 'JPEG' | 'PNG';
  presentationStyle?: 'modal' | 'signature-pad';
  closeAfterSave?: boolean;
};

type RNSignatureViewProps = {
  style?: ViewStyle;
  strokeWidth?: number;
  onSave?: (event: SignatureEvent) => void;
  onClear?: () => void;
  isSaveToLibrary?: boolean;
  showBaseline?: boolean;
  signatureColor?: string;
  outputFormat?: 'JPEG' | 'PNG';
};

const RNSignatureView =
  requireNativeComponent<RNSignatureViewProps>('RNSignatureView');

export type SignatureEvent = {
  nativeEvent: {
    path: string;
    uri?: string;
    name: string;
    width?: number;
    height?: number;
    size?: number;
    error?: boolean;
    message?: string;
  };
};

export type SignaturePadRef = {
  open: () => void;
  close: () => void;
  onClear: () => void;
  onSave: () => void;
};

const SignaturePad = React.forwardRef<SignaturePadRef, SignaturePadProps>(
  (
    {
      onSave,
      onClear,
      onError,
      backgroundColorButton = '#0066FF',
      isSaveToLibrary = true,
      lineWidth = 1.5,
      showBaseline = false,
      signatureColor = '#000000',
      outputFormat = 'JPEG',
      closeAfterSave = true,
      presentationStyle,
    },
    ref
  ) => {
    React.useImperativeHandle(ref, () => ({
      open: onOpen,
      close: onClose,
      onClear: clearSignature,
      onSave: saveSignature,
    }));

    const { signatureRef, executeCommandWithRetry } = useSignatureCommands();

    const [isVisible, setIsVisible] = React.useState(false);

    const onClose = React.useCallback(() => {
      setIsVisible(false);
    }, []);

    const onOpen = React.useCallback(() => {
      setIsVisible(true);
    }, []);

    const clearSignature = React.useCallback(() => {
      executeCommandWithRetry('clear', onClear);
    }, [executeCommandWithRetry, onClear]);

    const saveSignature = React.useCallback(() => {
      executeCommandWithRetry('save');
    }, [executeCommandWithRetry]);

    const handleSaveComplete = React.useCallback(
      (fileInfo: AssetSignature) => {
        onSave?.(fileInfo);
        if (closeAfterSave) {
          onClose();
        }
      },
      [onSave, onClose, closeAfterSave]
    );

    const handleSave = React.useCallback(
      (event: SignatureEvent) => {
        if (event.nativeEvent.error) {
          if (onError) {
            onError();
          } else {
            Alert.alert('Error', event.nativeEvent.message || '');
          }
          return;
        }

        try {
          const fileInfo = createFileInfo(event.nativeEvent);
          handleSaveComplete(fileInfo);
        } catch (error) {
          if (onError) {
            onError();
          } else {
            Alert.alert('Error', 'Please draw your signature first');
          }
        }
      },
      [handleSaveComplete, onError]
    );

    const renderSignaturePad = React.useMemo(() => {
      return (
        <RNSignatureView
          ref={signatureRef}
          style={styles.canvas}
          strokeWidth={lineWidth}
          onSave={handleSave}
          onClear={onClear}
          isSaveToLibrary={isSaveToLibrary}
          showBaseline={showBaseline}
          signatureColor={signatureColor}
          outputFormat={outputFormat}
        />
      );
    }, [
      signatureRef,
      lineWidth,
      handleSave,
      onClear,
      isSaveToLibrary,
      showBaseline,
      signatureColor,
      outputFormat,
    ]);

    const renderPage = React.useMemo(() => {
      switch (presentationStyle) {
        case 'modal':
          return (
            <SignatureModal
              isVisible={isVisible}
              onClose={onClose}
              renderSignaturePad={renderSignaturePad}
              backgroundColorButton={backgroundColorButton}
              clearSignature={clearSignature}
              saveSignature={saveSignature}
            />
          );
        case 'signature-pad':
          return (
            <Box height="100%" width="100%">
              {renderSignaturePad}
            </Box>
          );
        default:
          return (
            <SignatureBottomSheet
              isVisible={isVisible}
              onClose={onClose}
              renderSignaturePad={renderSignaturePad}
              clearSignature={clearSignature}
              saveSignature={saveSignature}
              backgroundColorButton={backgroundColorButton}
            />
          );
      }
    }, [
      backgroundColorButton,
      clearSignature,
      isVisible,
      onClose,
      presentationStyle,
      renderSignaturePad,
      saveSignature,
    ]);

    return <React.Fragment>{renderPage}</React.Fragment>;
  }
);

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});

export default SignaturePad;
