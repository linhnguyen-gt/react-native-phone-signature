import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SignaturePad, {
  type SignaturePadRef,
} from 'react-native-phone-signature';

export default function App() {
  const signaturePadRef = React.useRef<SignaturePadRef | null>(null);
  const [presentationStyle, setPresentationStyle] = React.useState<
    'fullScreen' | 'modal'
  >('modal');

  const handleOpenModal = React.useCallback(() => {
    signaturePadRef.current?.open();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            presentationStyle === 'modal' && styles.activeButton,
          ]}
          onPress={handleOpenModal}
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
          onPress={() => setPresentationStyle('fullScreen')}
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

      <SignaturePad
        ref={signaturePadRef}
        showBaseline={true}
        isSaveToLibrary={true}
        signatureColor="red"
        presentationStyle={presentationStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#007AFF',
  },
  activeButtonText: {
    color: 'white',
  },
});
