// import ImageResizer from '@bam.tech/react-native-image-resizer';
// import * as RNFS from '@dr.pogodin/react-native-fs';
// import { Canvas, Path, SkiaDomView } from '@shopify/react-native-skia';
// import * as MediaLibrary from 'expo-media-library';
import React from 'react';
import {
  Alert,
  findNodeHandle,
  Modal,
  Platform,
  requireNativeComponent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  type ViewStyle,
} from 'react-native';

export type AssetSignature = {
  path: string;
  uri: string;
  size: number;
  name: string;
  width: number;
  height: number;
};

type SignaturePadProps = {
  isVisible: boolean;
  onClose: () => void;
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

const COMMAND_CLEAR = 1;
const COMMAND_SAVE = 2;

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

const SignaturePad: React.FC<SignaturePadProps> = ({
  isVisible,
  onClose,
  onSave,
  onClear,
  backgroundColorButton,
  isSaveToLibrary = true,
  lineWidth = 1.5,
  showBaseline = false,
  signatureColor = '#000000',
  outputFormat = 'JPEG',
}) => {
  const signatureRef = React.useRef(null);

  // Move commands creation into a useCallback to ensure it gets the latest ref
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

    // iOS uses string commands
    return {
      clear: () => {
        console.log('Dispatching clear command to iOS');
        UIManager.dispatchViewManagerCommand(
          nodeHandle,
          'clear', // Use string command
          []
        );
      },
      save: () =>
        UIManager.dispatchViewManagerCommand(
          nodeHandle,
          'save', // Use string command
          []
        ),
    };
  }, []);

  const clearSignature = React.useCallback(() => {
    console.log('Clearing signature...');
    const commands = getCommands();
    if (commands) {
      console.log('Commands available, clearing...');
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
      const { path, uri, name, width, height, size } = event.nativeEvent;
      const fileInfo: AssetSignature = {
        path,
        uri: uri || `file://${path}`,
        name: name.replace('.jpg', outputFormat === 'PNG' ? '.png' : '.jpg'),
        size: size || 0,
        width: width || 940,
        height: height || 788,
      };

      console.log('Signature saved:', fileInfo);

      if (!isSaveToLibrary) {
        onSave?.(fileInfo);
        onClose();
        return;
      }

      onSave?.(fileInfo);
      Alert.alert('Success', 'Signature saved successfully!');
      onClose();
    },
    [outputFormat, isSaveToLibrary, onSave, onClose]
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

          <Text style={styles.subtitle}>Please sign within the box below</Text>

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
};

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
