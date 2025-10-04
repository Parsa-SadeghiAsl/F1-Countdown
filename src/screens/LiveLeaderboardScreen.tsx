import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { getLatestSession, getDrivers, getPositions, getIntervals, getSessionResults } from '../services/API';
import { LiveSession, LiveDriver, LivePosition, LiveInterval, LeaderboardEntry, LiveSessionResult } from '../types';
import { colors } from '../styles/theme';

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
    const sortedResults = results.sort((a, b) => a.position - b.position);
    console.log(results)
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
        <View style={styles.timingInfo}>
          <Text style={styles.gapText}>{item.position === 1 ? item.interval || 'LAP' : item.gap_to_leader || '--'}</Text>
          <Text style={styles.intervalText}>{item.position > 1 && (item.interval || '--')}</Text>
        </View>
      )
      : (
        <View style={styles.timingInfo}>
          <Text style={styles.gapText}>{item.display_time}</Text>
          {item.points && item.points > 0 ? <Text style={styles.pointsText}>+{item.points} PTS</Text> : null}
        </View>
      );

    return (
      <Card style={styles.itemCard}>
        <View style={styles.itemContainer}>
          <View style={[styles.teamColorBar, { backgroundColor: item.team_colour || colors.subtle }]} />
          <Text style={styles.position}>{item.position}</Text>
          <Image source={{ uri: item.headshot_url }} style={styles.headshot} />
          <View style={styles.driverInfo}>
            <Text style={styles.title}>{item.full_name}</Text>
            <Text style={styles.subtitle}>{item.team_name}</Text>
          </View>
          {timingDisplay}
        </View>
      </Card>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTitleContainer}>
        <Text variant="headlineSmall" style={styles.headerTitle}>{session?.session_name} - {session?.circuit_short_name}</Text>
        {session?.isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      <Text variant="bodyMedium" style={styles.headerSubtitle}>
        {session?.isLive ? 'Live Leaderboard' : 'Final Results'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.messageText}>Searching for a live session...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Image source={require('../assets/f1.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.messageText}>No live or recent F1 event found.</Text>
        <Text style={styles.messageSubText}>Check back during a race weekend!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.driver_number.toString()}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.messageText}>Waiting for session data...</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  logo: {
    width: 120,
    height: 30,
    tintColor: colors.primary,
    marginBottom: 20,
  },
  messageText: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  messageSubText: {
    color: colors.subtle,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: { color: colors.primary, fontSize: 16 },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    color: colors.text,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.subtle,
    marginTop: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamColorBar: {
    width: 6,
    height: '100%',
  },
  position: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    width: 40,
    textAlign: 'center',
  },
  headshot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  driverInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    color: colors.subtle,
  },
  timingInfo: {
    alignItems: 'flex-end',
    paddingRight: 12
  },
  gapText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  intervalText: {
    fontSize: 12,
    color: colors.subtle,
    marginTop: 2
  },
  pointsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default LiveLeaderboardScreen;

