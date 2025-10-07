import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNavigation, Provider as PaperProvider } from 'react-native-paper';
import RaceListScreen from './src/screens/RaceListScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import { theme } from './src/styles/globalStyles';

const App = (): React.JSX.Element => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'schedule', title: 'Schedule', focusedIcon: 'calendar-clock', unfocusedIcon: 'calendar-clock-outline'},
    { key: 'results', title: 'Results', focusedIcon: 'radio-tower', unfocusedIcon: 'radio-tower' },
    { key: 'standings', title: 'Standings', focusedIcon: 'trophy', unfocusedIcon: 'trophy-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    schedule: RaceListScreen,
    results: ResultsScreen,
    standings: StandingsScreen,
  });

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
          barStyle={{ backgroundColor: theme.colors.surface }}
          activeColor={theme.colors.primary}
          inactiveColor={theme.colors.onSurfaceDisabled}
        />
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
