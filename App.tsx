// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import RaceListScreen from './src/screens/RaceListScreen';
import { theme, colors } from './src/styles/theme';

const App = (): React.JSX.Element => {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar barStyle={'light-content'} backgroundColor={colors.background} />
          <RaceListScreen />
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
