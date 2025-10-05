import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNavigation, Provider as PaperProvider } from 'react-native-paper';
import RaceListScreen from './src/screens/RaceListScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import LiveLeaderboardScreen from './src/screens/LiveLeaderboardScreen';
import { theme } from './src/styles/globalStyles';

const App = (): React.JSX.Element => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'schedule', title: 'Schedule', focusedIcon: 'calendar-clock', unfocusedIcon: 'calendar-clock-outline'},
    { key: 'live', title: 'Live', focusedIcon: 'radio-tower', unfocusedIcon: 'radio-tower' },
    { key: 'standings', title: 'Standings', focusedIcon: 'trophy', unfocusedIcon: 'trophy-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    schedule: RaceListScreen,
    live: LiveLeaderboardScreen,
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
