import React, { createContext, useContext, useState } from 'react';

type Screen = 'Home' | 'Custom';

interface NavigationContextType {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Home');

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
