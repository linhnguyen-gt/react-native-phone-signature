import React from 'react';
import {
  Alert,
  Modal,
  requireNativeComponent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
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
  backgroundColorButton?: string;
  isSaveToLibrary?: boolean;
  lineWidth?: number;
  showBaseline?: boolean;
  signatureColor?: string;
  outputFormat?: 'JPEG' | 'PNG';
  presentationStyle?: 'fullScreen' | 'modal';
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
      backgroundColorButton,
      isSaveToLibrary = true,
      lineWidth = 1.5,
      showBaseline = false,
      signatureColor = '#000000',
      outputFormat = 'JPEG',
    },
    ref
  ) => {
    React.useImperativeHandle(ref, () => ({
      open: onOpen,
      close: onClose,
      onClear: clearSignature,
    }));

    const [isVisible, setIsVisible] = React.useState(false);

    const onClose = React.useCallback(() => {
      setIsVisible(false);
    }, []);

    const onOpen = React.useCallback(() => {
      setIsVisible(true);
    }, []);

    const signatureRef = React.useRef(null);

    const getCommands = useManagerCommand(signatureRef);

    const clearSignature = React.useCallback(() => {
      const commands = getCommands();
      if (commands) {
        commands.clear();
        onClear?.();
      }
    }, [getCommands, onClear]);

    const saveSignature = React.useCallback(() => {
      const commands = getCommands();
      if (commands) {
        commands.save();
      }
    }, [getCommands]);

    const handleSave = React.useCallback(
      (event: SignatureEvent) => {
        const nativeEvent = event.nativeEvent;

        const fileInfo: AssetSignature = {
          path: nativeEvent.path || '',
          uri: nativeEvent.uri ? `file://${nativeEvent.uri}` : '',
          name: nativeEvent.name || '',
          size: nativeEvent.size || 0,
          width: nativeEvent.width || 940,
          height: nativeEvent.height || 788,
        };

        console.log('FileInfo created:', fileInfo);

        if (!isSaveToLibrary) {
          onSave?.(fileInfo);
          onClose();
          return;
        }

        onSave?.(fileInfo);
        Alert.alert('Success', 'Signature saved successfully!');
        onClose();
      },
      [isSaveToLibrary, onSave, onClose]
    );

    return (
      <Modal
        visible={isVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Your Signature</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
});

export default SignaturePad;
