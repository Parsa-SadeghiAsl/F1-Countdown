import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { getLatestSession, getDrivers, getPositions, getIntervals, getSessionResults } from '../services/API';
import { LiveSession, LiveDriver, LivePosition, LiveInterval, LeaderboardEntry, LiveSessionResult } from '../types';
import { colors, globalStyles } from '../styles/globalStyles';

const POLLING_INTERVAL = 5000; // 5 seconds

const LiveLeaderboardScreen = (): React.JSX.Element => {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [drivers, setDrivers] = useState<Map<number, LiveDriver>>(new Map());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processLeaderboardData = useCallback((
    driverMap: Map<number, LiveDriver>,
    positions: LivePosition[],
    intervals: LiveInterval[]
  ): LeaderboardEntry[] => {
    const latestPositions = new Map<number, LivePosition>();
    for (const pos of positions) {
      if (!latestPositions.has(pos.driver_number)) {
        latestPositions.set(pos.driver_number, pos);
      }
    }

    const latestIntervals = new Map<number, LiveInterval>();
    for (const interval of intervals) {
      if (!latestIntervals.has(interval.driver_number)) {
        latestIntervals.set(interval.driver_number, interval);
      }
    }

    const combined: LeaderboardEntry[] = [];
    for (const [driverNumber, driverInfo] of driverMap.entries()) {
      const positionData = latestPositions.get(driverNumber);
      if (positionData) {
        const intervalData = latestIntervals.get(driverNumber);
        combined.push({
          driver_number: driverNumber,
          full_name: driverInfo.full_name,
          team_name: driverInfo.team_name,
          team_colour: `#${driverInfo.team_colour}`.padEnd(7, '0'), // Ensure valid color hex
          headshot_url: driverInfo.headshot_url,
          position: positionData.position,
          gap_to_leader: intervalData?.gap_to_leader,
          interval: intervalData?.interval,
        });
      }
    }

    return combined.sort((a, b) => a.position - b.position);
  }, []);

  const formatTime = (timeInSeconds: number | null | undefined): string => {
    if (timeInSeconds == null || isNaN(timeInSeconds)) return '';
    const date = new Date(0);
    const timeInms = (timeInSeconds * 1000) % 1000;
    date.setSeconds(Math.floor(timeInSeconds), timeInms)
    if (timeInSeconds < 3600) {
    return date.toISOString().substring(14, 22); // MM:SS.mss
    } else {
    return date.toISOString().substring(11, 22); // HH:MM:SS
    }
  };

  const processSessionResultsData = useCallback((
    driverMap: Map<number, LiveDriver>,
    results: LiveSessionResult[],
    sessionName: string
  ): LeaderboardEntry[] => {
    results.forEach(result => {
      result.position = result.dnf ? 100 : result.position
      result.position = result.dsq ? 101 : result.position
      result.position = result.dns ? 102 : result.position
      result.position = result.position == null ? 103 :result.position
    });
    const sortedResults = results.sort((a, b) => a.position - b.position);
    const leaderTime = sortedResults[0]?.duration;

    return sortedResults.map(result => {
      const driverInfo = driverMap.get(result.driver_number);
      if (!driverInfo) return null;
      let display_time = '';
      if (sessionName.toLowerCase().includes('race')) {
        if (result.status !== 'Finished') {
          display_time = result.status;
        } else if (result.position === 1 && result.duration) {
          display_time = formatTime(result.duration);
        } else if (result.duration && leaderTime) {
          const gap = result.duration - leaderTime;
          display_time = `+${gap.toFixed(3)}s`;
        }
      } else if (sessionName.toLowerCase().includes('qualifying')) {
        for (let i = 0; i < 3; i++){
          if(result.duration[i] != null ){
            display_time = `Q${i+1} ${formatTime(result.duration[i])}`
          }
        }
      
      } else { // Practice or Sprint Shootout
        display_time = formatTime(result.duration) || 'N/A';
      }

      return {
        driver_number: result.driver_number,
        full_name: driverInfo.full_name,
        team_name: driverInfo.team_name,
        team_colour: `#${driverInfo.team_colour}`.padEnd(7, '0'),
        headshot_url: driverInfo.headshot_url,
        position: result.position,
        status: result.status,
        points: result.points,
        display_time,
      };
    }).filter(Boolean) as LeaderboardEntry[];
  }, []);

  const fetchLiveData = useCallback(async (sessionKey: number) => {
    try {
      const [positions, intervals] = await Promise.all([
        getPositions(sessionKey),
        getIntervals(sessionKey),
      ]);
      setLeaderboard(processLeaderboardData(drivers, positions, intervals));
    } catch (err) {
      console.error("Failed to fetch live data", err);
    }
  }, [drivers, processLeaderboardData]);


  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);
      try {
        const sessionData = await getLatestSession();
        setSession(sessionData);

        if (sessionData) {
          const driverData = await getDrivers(sessionData.session_key);
          const driverMap = new Map<number, LiveDriver>(driverData.map(d => [d.driver_number, d]));
          setDrivers(driverMap);

          if (sessionData.isLive) {
            const [positions, intervals] = await Promise.all([
              getPositions(sessionData.session_key),
              getIntervals(sessionData.session_key),
            ]);
            setLeaderboard(processLeaderboardData(driverMap, positions, intervals));
          } else {
            const results = await getSessionResults(sessionData.session_key);
            setLeaderboard(processSessionResultsData(driverMap, results, sessionData.session_name));
          }
        }
      } catch (err) {
        setError('Could not load session data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [processLeaderboardData, processSessionResultsData]);


  useEffect(() => {
    if (session?.isLive && session.session_key && drivers.size > 0) {
      fetchLiveData(session.session_key);
      const intervalId = setInterval(() => fetchLiveData(session.session_key), POLLING_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [session, drivers, fetchLiveData]);


  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => {
    const timingDisplay = session?.isLive
      ? (
        <View style={globalStyles.timingInfo}>
          <Text style={globalStyles.gapText}>{item.position === 1 ? item.interval || 'LAP' : item.gap_to_leader || '--'}</Text>
          <Text style={globalStyles.intervalText}>{item.position > 1 && (item.interval || '--')}</Text>
        </View>
      )
      : (
        <View style={globalStyles.timingInfo}>
          <Text style={globalStyles.gapText}>{item.display_time}</Text>
          {item.points && item.points > 0 ? <Text style={globalStyles.pointsText}>+{item.points} PTS</Text> : null}
        </View>
      );

    return (
      <Card style={globalStyles.itemCard}>
        <View style={globalStyles.itemContainer}>
          <View style={[globalStyles.teamColorBar, { backgroundColor: item.team_colour || colors.subtle }]} />
          <Text style={globalStyles.position}>{item.position === 100 ? 'DNF':item.position === 101 ? 'DSQ': item.position === 102 ? 'DNS': item.position == 103 ? "N/A": item.position}</Text>
          <Image source={{ uri: item.headshot_url }} style={globalStyles.headshot} />
          <View style={globalStyles.driverInfo}>
            <Text style={globalStyles.title}>{item.full_name}</Text>
            <Text style={globalStyles.subtitle}>{item.team_name}</Text>
          </View>
          {timingDisplay}
        </View>
      </Card>
    );
  };

  const ListHeader = () => (
    <View style={globalStyles.headerContainer}>
      <View style={globalStyles.headerTitleContainer}>
        <Text variant="headlineSmall" style={globalStyles.headerTitle}>{session?.session_name}</Text>
        {session?.isLive && (
          <View style={globalStyles.liveIndicator}>
            <View style={globalStyles.liveDot} />
            <Text style={globalStyles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      <Text variant="bodyMedium" style={globalStyles.headerSubtitle}>
        {session?.isLive ?`Live Leaderboard - ${session?.circuit_short_name}` : `Final Results - ${session?.circuit_short_name}`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={globalStyles.messageText}>Searching for a live session...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.center}>
        <Text style={globalStyles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={globalStyles.center}>
        <Image source={require('../assets/f1.png')} style={globalStyles.logo} resizeMode="contain" />
        <Text style={globalStyles.messageText}>No live or recent F1 event found.</Text>
        <Text style={globalStyles.messageSubText}>Check back during a race weekend!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container} edges={['top']}>
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.driver_number.toString()}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={() => (
          <View style={globalStyles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={globalStyles.messageText}>Waiting for session data...</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default LiveLeaderboardScreen;