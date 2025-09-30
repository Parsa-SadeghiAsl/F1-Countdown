import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import RaceListScreen from './src/screens/RaceListScreen';

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>
        <StatusBar barStyle={'dark-content'} />
        <RaceListScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;
