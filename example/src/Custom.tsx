import React from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SignaturePad, {
  type AssetSignature,
  type SignaturePadRef,
} from 'react-native-phone-signature';
import { useNavigation } from './NavigationContext';

const Custom = () => {
  const { navigate } = useNavigation();
  const signaturePadRef = React.useRef<SignaturePadRef>(null);

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

  const colors = {
    primary: '#4F46E5',
    secondary: '#7C3AED',
    accent: '#EC4899',
    success: '#10B981',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigate('Home')}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Digital Signature
        </Text>
      </View>

      {/* Signature Area */}
      <View style={styles.signatureContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Create Your Signature</Text>
          <Text style={styles.subtitle}>
            Use your finger or stylus to sign below
          </Text>
        </View>

        <View style={styles.signatureArea}>
          <SignaturePad
            ref={signaturePadRef}
            onSave={handleSave}
            onClear={handleClear}
            onError={handleError}
            showBaseline={true}
            isSaveToLibrary={true}
            closeAfterSave={true}
            signatureColor={colors.primary}
            presentationStyle="signature-pad"
            backgroundColorButton={colors.primary}
          />
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.clearButton, { borderColor: colors.secondary }]}
          onPress={() => signaturePadRef.current?.onClear()}
        >
          <Text style={[styles.clearButtonText, { color: colors.secondary }]}>
            Clear
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={() => signaturePadRef.current?.onSave()}
        >
          <Text style={styles.saveButtonText}>Save Signature</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    letterSpacing: 0.2,
  },
  signatureContainer: {
    flex: 1,
    padding: 20,
  },
  signatureArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F7FF',
    borderWidth: 2,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default Custom;
