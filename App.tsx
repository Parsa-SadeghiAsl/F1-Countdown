import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import RaceListScreen from './src/screens/RaceListScreen';

// Optional: Define a custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#E10600', // F1 Red
    accent: '#3F3F3F',
  },
};

const App = (): React.JSX.Element => {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
          <StatusBar barStyle={'dark-content'} backgroundColor="#f4f4f4" />
          <RaceListScreen />
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
