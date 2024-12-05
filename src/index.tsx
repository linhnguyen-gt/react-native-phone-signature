import React from 'react';
import {
  Alert,
  Modal,
  requireNativeComponent,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { Box, Text, Touchable } from './component';
import { useManagerCommand } from './hooks';

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
  presentationStyle?: 'fullScreen' | 'modal' | 'signature-pad' | 'pageSheet';
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

type SignatureEvent = {
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
};

const SignaturePad = React.forwardRef<SignaturePadRef, SignaturePadProps>(
  (
    {
      onSave,
      onClear,
      onError,
      backgroundColorButton,
      isSaveToLibrary = true,
      lineWidth = 1.5,
      showBaseline = false,
      signatureColor = '#000000',
      outputFormat = 'JPEG',
      closeAfterSave = true,
      presentationStyle = 'pageSheet',
    },
    ref
  ) => {
    React.useImperativeHandle(ref, () => ({
      open: onOpen,
      close: onClose,
      onClear: clearSignature,
    }));
    const signatureRef = React.useRef<any>(null);
    const commandsRef = React.useRef<any>(null);
    const [commands, setCommands] = React.useState<any>(null);
    const getCommands = useManagerCommand(signatureRef);

    React.useEffect(() => {
      const currentCommands = getCommands();
      console.log('Effect getCommands:', currentCommands);

      if (currentCommands) {
        commandsRef.current = currentCommands;
        setCommands(currentCommands);
      }
    }, [getCommands]);

    const [isVisible, setIsVisible] = React.useState(false);

    const onClose = React.useCallback(() => {
      setIsVisible(false);
    }, []);

    const onOpen = React.useCallback(() => {
      setIsVisible(true);
    }, []);

    const clearSignature = React.useCallback(() => {
      const currentCommands = commands || commandsRef.current || getCommands();

      if (!currentCommands) {
        let attempts = 0;
        const maxAttempts = 5;

        const tryGetCommands = () => {
          attempts++;
          const retryCommands =
            commands || commandsRef.current || getCommands();
          if (retryCommands) {
            commandsRef.current = retryCommands;
            setCommands(retryCommands);
            retryCommands.clear();
            onClear?.();
          } else if (attempts < maxAttempts) {
            setTimeout(tryGetCommands, 200);
          }
        };

        setTimeout(tryGetCommands, 200);
        return;
      }

      currentCommands.clear();
      onClear?.();
    }, [commands, getCommands, onClear]);

    const createFileInfo = React.useCallback(
      (nativeEvent: SignatureEvent['nativeEvent']): AssetSignature => ({
        path: nativeEvent.path || '',
        uri: nativeEvent.uri ? `file://${nativeEvent.uri}` : '',
        name: nativeEvent.name || '',
        size: nativeEvent.size || 0,
        width: nativeEvent.width || 940,
        height: nativeEvent.height || 788,
      }),
      []
    );

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
      [createFileInfo, handleSaveComplete, onError]
    );
    const saveSignature = React.useCallback(() => {
      const currentCommands = commands || commandsRef.current || getCommands();

      if (!currentCommands) {
        let attempts = 0;
        const maxAttempts = 5;

        const tryGetCommands = () => {
          attempts++;
          const retryCommands =
            commands || commandsRef.current || getCommands();
          if (retryCommands) {
            commandsRef.current = retryCommands;
            setCommands(retryCommands);
            retryCommands.save();
          } else if (attempts < maxAttempts) {
            setTimeout(tryGetCommands, 200);
          }
        };

        setTimeout(tryGetCommands, 200);
        return;
      }

      currentCommands.save();
    }, [commands, getCommands]);

    const renderPage = React.useMemo(() => {
      switch (presentationStyle) {
        case 'modal':
          return (
            <Modal
              visible={isVisible}
              animationType="fade"
              transparent={true}
              onRequestClose={onClose}
            >
              <SafeAreaView style={[styles.safeArea, styles.centeredModal]}>
                <View style={[styles.modalContent, styles.centeredContent]}>
                  <View style={styles.header}>
                    <Text style={styles.title}>Your Signature</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={onClose}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.subtitle}>
                    Please sign within the box below
                  </Text>

                  <View style={styles.canvasContainer}>
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
                  </View>

                  <View style={styles.buttonContainer}>
                    <View style={styles.buttonGroup}>
                      <TouchableOpacity
                        style={[styles.button, styles.clearButton]}
                        onPress={clearSignature}
                      >
                        <Text style={styles.cancelButtonText}>Clear</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.saveButton,
                          {
                            backgroundColor: backgroundColorButton ?? '#0066FF',
                            shadowColor: backgroundColorButton ?? '#0066FF',
                          },
                        ]}
                        onPress={saveSignature}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </SafeAreaView>
            </Modal>
          );
        case 'signature-pad':
          return (
            <Box height="100%" width="100%">
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
                safeArea
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
                        backgroundColor={backgroundColorButton ?? '#0066FF'}
                        shadowColor={backgroundColorButton ?? '#0066FF'}
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
      handleSave,
      isSaveToLibrary,
      isVisible,
      lineWidth,
      onClear,
      onClose,
      outputFormat,
      presentationStyle,
      saveSignature,
      showBaseline,
      signatureColor,
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
