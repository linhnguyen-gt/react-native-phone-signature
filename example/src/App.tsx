import { SafeAreaView, StyleSheet } from 'react-native';
import Custom from './Custom';
import Main from './Main';
import { NavigationProvider, useNavigation } from './NavigationContext';

const App = () => {
  return (
    <NavigationProvider>
      <SafeAreaView style={styles.container}>
        <AppContent />
      </SafeAreaView>
    </NavigationProvider>
  );
};

const AppContent = () => {
  const { currentScreen } = useNavigation();

  switch (currentScreen) {
    case 'Home':
      return <Main />;
    case 'Custom':
      return <Custom />;
    default:
      return <Main />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
