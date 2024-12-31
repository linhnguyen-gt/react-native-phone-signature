import SignaturePad, {
  type SignaturePadRef,
} from '@linhnguyen96114/react-native-phone-signature';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SignatureFullScreen = () => {
  const signaturePadRef = React.useRef<SignaturePadRef>(null);

  const handleSave = React.useCallback(() => {
    signaturePadRef.current?.onSave();
    Alert.alert('Success', `Signature saved!`);
  }, []);

  const handleClear = React.useCallback(() => {
    signaturePadRef.current?.onClear();
  }, []);

  return (
    <View style={styles.inlineContainer}>
      <Text style={styles.inlineTitle}>Inline Signature Pad:</Text>
      <View>
        <SignaturePad
          ref={signaturePadRef}
          presentationStyle="signature-pad"
          showBaseline={true}
          signatureColor="#fd79a8"
          onSave={(file) => console.log('Signature saved!', file)}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ecf0f1',
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

export default SignatureFullScreen;
