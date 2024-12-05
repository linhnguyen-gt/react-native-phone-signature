import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SignaturePad, {
  type AssetSignature,
  type SignaturePadRef,
} from 'react-native-phone-signature';

export default function App() {
  const signaturePadRef = React.useRef<SignaturePadRef>(null);
  const [presentationStyle, setPresentationStyle] = React.useState<
    'fullScreen' | 'modal' | 'pageSheet' | 'signature-pad'
  >('modal');

  const handleOpenModal = React.useCallback(
    (style: 'fullScreen' | 'modal' | 'pageSheet' | 'signature-pad') => {
      setPresentationStyle(style);
      signaturePadRef.current?.open();
    },
    []
  );

  const handleSave = React.useCallback((file: AssetSignature) => {
    console.log('Signature saved:', file);
    Alert.alert('Success', `Signature saved!\nFile path: ${file.path}`);
  }, []);

  const handleClear = React.useCallback(() => {
    signaturePadRef.current?.onClear();
  }, []);

  return (
    <React.Fragment>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              presentationStyle === 'pageSheet' && styles.activeButton,
            ]}
            onPress={() => handleOpenModal('pageSheet')}
          >
            <Text
              style={[
                styles.buttonText,
                presentationStyle === 'pageSheet' && styles.activeButtonText,
              ]}
            >
              Bottom Sheet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              presentationStyle === 'modal' && styles.activeButton,
            ]}
            onPress={() => handleOpenModal('modal')}
          >
            <Text
              style={[
                styles.buttonText,
                presentationStyle === 'modal' && styles.activeButtonText,
              ]}
            >
              Modal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              presentationStyle === 'fullScreen' && styles.activeButton,
            ]}
            onPress={() => handleOpenModal('fullScreen')}
          >
            <Text
              style={[
                styles.buttonText,
                presentationStyle === 'fullScreen' && styles.activeButtonText,
              ]}
            >
              Full Screen
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inlineContainer}>
          <Text style={styles.inlineTitle}>Inline Signature Pad:</Text>
          <View style={{ borderWidth: 1, borderColor: 'red' }}>
            <SignaturePad
              ref={signaturePadRef}
              presentationStyle="signature-pad"
              showBaseline={true}
              signatureColor="blue"
              onSave={handleSave}
              onClear={() => console.log('Signature cleared!')}
            />
            <View style={styles.inlineButtonContainer}>
              <TouchableOpacity
                style={[styles.inlineButton, styles.clearButton]}
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.inlineButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <SignaturePad
        ref={signaturePadRef}
        onSave={handleSave}
        onClear={() => console.log('Signature cleared!')}
        // onError={() => Alert.alert('Error', 'Please draw your signature first')}
        showBaseline={true}
        isSaveToLibrary={true}
        closeAfterSave={true}
        signatureColor="red"
        presentationStyle={presentationStyle}
        backgroundColorButton="#007AFF"
      />
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    marginBottom: 20,
    width: '100%',
    gap: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  activeButtonText: {
    color: 'white',
  },
  inlineContainer: {
    height: 200,
    width: '100%',
    marginTop: 20,
  },
  inlineTitle: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  inlineButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  inlineButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
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
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
