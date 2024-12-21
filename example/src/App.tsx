import { SafeAreaView } from 'react-native';
import Custom from './Custom';
import Main from './Main';
import { NavigationProvider, useNavigation } from './NavigationContext';

const App = () => {
  return (
    <NavigationProvider>
      <SafeAreaView style={{ flex: 1 }}>
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

export default App;
