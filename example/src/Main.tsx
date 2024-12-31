import SignaturePad, {
  type AssetSignature,
  type SignaturePadRef,
} from '@linhnguyen96114/react-native-phone-signature';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from './NavigationContext';

const Main = () => {
  const { navigate } = useNavigation();
  const signaturePadRef = React.useRef<SignaturePadRef>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleSave = React.useCallback((file: AssetSignature) => {
    console.log('Signature saved!', file);
    Alert.alert('Success', 'Signature saved successfully!');
  }, []);

  const handleClear = React.useCallback(() => {
    console.log('Signature cleared!');
    Alert.alert('Success', 'Signature cleared successfully!');
  }, []);

  const handleError = React.useCallback(() => {
    console.log('Signature error: Please draw your signature first');
    Alert.alert('Error', 'Please draw your signature first');
  }, []);

  const buttons = [
    {
      title: 'Bottom Sheet',
      onPress: () => {
        setActiveIndex(0);
        signaturePadRef.current?.open();
      },
      presentationStyle: undefined,
      icon: '↓',
      activeColor: '#4F46E5',
    },
    {
      title: 'Modal',
      onPress: () => {
        setActiveIndex(1);
        signaturePadRef.current?.open();
      },
      presentationStyle: 'modal' as const,
      icon: '⊡',
      activeColor: '#7C3AED',
    },
    {
      title: 'Custom Signature Pad',
      onPress: () => {
        setActiveIndex(2);
        navigate('Custom');
      },
      icon: '⛶',
      activeColor: '#EC4899',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Signature Demo</Text>
        <Text style={styles.subtitle}>
          Choose your preferred signature mode
        </Text>

        <View style={styles.buttonContainer}>
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={button.title}
              style={[
                styles.button,
                activeIndex === index && [
                  styles.activeButton,
                  { backgroundColor: button.activeColor },
                ],
              ]}
              onPress={button.onPress}
            >
              <Text
                style={[
                  styles.buttonIcon,
                  {
                    color:
                      activeIndex === index ? '#FFFFFF' : button.activeColor,
                  },
                ]}
              >
                {button.icon}
              </Text>
              <Text
                style={[
                  styles.buttonText,
                  activeIndex === index && styles.activeButtonText,
                ]}
              >
                {button.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <SignaturePad
        ref={signaturePadRef}
        onSave={handleSave}
        onClear={handleClear}
        onError={handleError}
        showBaseline={true}
        isSaveToLibrary={true}
        closeAfterSave={true}
        signatureColor="red"
        presentationStyle={buttons[activeIndex]?.presentationStyle}
        backgroundColorButton="#007AFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  activeButton: {
    borderWidth: 0,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
});

export default Main;
