import React from 'react';
import {
  Alert,
  Modal,
  requireNativeComponent,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Box, SignatureModal, Text, Touchable } from './component';
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
            <Modal
              visible={isVisible}
              animationType="fade"
              transparent={true}
              onRequestClose={onClose}
            >
              <Box
                flex={1}
                backgroundColor="rgba(0, 0, 0, 0.5)"
                justifyContent="flex-end"
              >
                <Box
                  backgroundColor="#FFFFFF"
                  borderTopLeftRadius={24}
                  borderTopRightRadius={24}
                  paddingTop={20}
                  paddingHorizontal={16}
                  paddingBottom={24}
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    marginBottom={12}
                  >
                    <Text
                      fontSize={20}
                      fontWeight="600"
                      color="#1a1a1a"
                      textAlign="center"
                    >
                      Your Signature
                    </Text>
                    <Touchable
                      position="absolute"
                      right={0}
                      top={0}
                      padding={8}
                      onPress={onClose}
                    >
                      <Text fontSize={18} color="#666666">
                        ✕
                      </Text>
                    </Touchable>
                  </Box>

                  <Text
                    fontSize={14}
                    color="#666666"
                    textAlign="center"
                    marginBottom={16}
                  >
                    Please sign within the box below
                  </Text>

                  <Box
                    height={300}
                    backgroundColor="#ffffff"
                    borderRadius={12}
                    shadowColor="#000"
                    shadowOffset={{
                      width: 0,
                      height: 2,
                    }}
                    shadowOpacity={0.1}
                    shadowRadius={8}
                    elevation={5}
                    borderWidth={1}
                    borderColor="#E5E7EB"
                    marginBottom={20}
                    overflow="hidden"
                  >
                    {renderSignaturePad}
                  </Box>

                  <Box gap={12}>
                    <Box flexDirection="row" gap={12}>
                      <Touchable
                        paddingVertical={14}
                        borderRadius={12}
                        alignItems="center"
                        justifyContent="center"
                        flex={1}
                        backgroundColor="#F3F4F6"
                        borderWidth={1}
                        borderColor="#E5E7EB"
                        onPress={clearSignature}
                      >
                        <Text color="#374151" fontSize={16} fontWeight="500">
                          Clear
                        </Text>
                      </Touchable>
                      <Touchable
                        paddingVertical={14}
                        borderRadius={12}
                        alignItems="center"
                        justifyContent="center"
                        flex={1}
                        shadowOffset={{
                          width: 0,
                          height: 2,
                        }}
                        shadowOpacity={0.25}
                        shadowRadius={4}
                        elevation={4}
                        backgroundColor={backgroundColorButton}
                        shadowColor={backgroundColorButton}
                        onPress={saveSignature}
                      >
                        <Text color="#FFFFFF" fontSize={16} fontWeight="600">
                          Save
                        </Text>
                      </Touchable>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Modal>
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
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666666',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  canvasContainer: {
    height: 300,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    flex: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  clearButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centeredModal: {
    justifyContent: 'center',
  },
  centeredContent: {
    marginHorizontal: 16,
    maxHeight: '90%',
    borderRadius: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});

export default SignaturePad;
