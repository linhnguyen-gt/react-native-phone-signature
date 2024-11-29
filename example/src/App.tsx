import { StyleSheet, View } from 'react-native';
import SignaturePad from 'react-native-phone-signature';

export default function App() {
  return (
    <View style={styles.container}>
      <SignaturePad
        isVisible={true}
        onClose={() => {}}
        showBaseline={true}
        isSaveToLibrary={true}
        signatureColor="red"
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
});
