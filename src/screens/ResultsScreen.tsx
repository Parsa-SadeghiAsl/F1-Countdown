import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, FlatList, Image, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { getMeetings, getSessions, getDrivers, getSessionResults } from '../services/API';
import { LiveSession, LiveDriver, LeaderboardEntry, LiveSessionResult, Meeting } from '../types';
import { colors, globalStyles } from '../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

const ResultsScreen = (): React.JSX.Element => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<Map<number, LiveDriver>>(new Map());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const meetingScrollViewRef = useRef<ScrollView>(null);
  const sessionScrollViewRef = useRef<ScrollView>(null);
  const meetingLayouts = useRef<Map<number, { x: number; width: number }>>(new Map());
  const sessionLayouts = useRef<Map<number, { x: number; width: number }>>(new Map());

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);
      try {
        const year = new Date().getFullYear();
        const meetingsData = await getMeetings(year);
        setMeetings(meetingsData);
        if (meetingsData.length > 0) {
          const lastMeeting = meetingsData[meetingsData.length - 1];
          setSelectedMeeting(lastMeeting.meeting_key);
        }
      } catch (err) {
        setError('Could not load season data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (selectedMeeting) {
      const fetchSessions = async () => {
        const sessionsData = await getSessions(selectedMeeting);
        setSessions(sessionsData);
        if (sessionsData.length > 0) {
          // Select the last session by default (usually the race)
          const lastSession = sessionsData[sessionsData.length - 1];
          setSelectedSession(lastSession.session_key);
        }
      };
      fetchSessions();
    }
  }, [selectedMeeting]);

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

  useEffect(() => {
    if (selectedSession) {
      const fetchResults = async () => {
        setLoading(true);
        try {
          const driverData = await getDrivers(selectedSession);
          const driverMap = new Map<number, LiveDriver>(driverData.map(d => [d.driver_number, d]));
          setDrivers(driverMap);

          const results = await getSessionResults(selectedSession);
          const session = sessions.find(s => s.session_key === selectedSession);
          setLeaderboard(processSessionResultsData(driverMap, results, session?.session_name || ''));
        } catch (err) {
          setError('Could not load session results.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [selectedSession, processSessionResultsData, sessions]);

  const renderLeaderboardItem = useCallback(({ item }: { item: LeaderboardEntry }) => {
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
          <View style={globalStyles.timingInfo}>
            <Text style={globalStyles.gapText}>{item.display_time}</Text>
            {item.points && item.points > 0 ? <Text style={globalStyles.pointsText}>+{item.points} PTS</Text> : null}
          </View>
        </View>
      </Card>
    );
  }, []);

  const ListHeader = () => {
    const handleMeetingPress = (meetingKey: number) => {
      setSelectedMeeting(meetingKey);
      const layout = meetingLayouts.current.get(meetingKey);
      if (layout && meetingScrollViewRef.current) {
        meetingScrollViewRef.current.scrollTo({ x: layout.x - (screenWidth / 2) + (layout.width / 2), animated: true });
      }
    };

    const handleSessionPress = (sessionKey: number) => {
      setSelectedSession(sessionKey);
      const layout = sessionLayouts.current.get(sessionKey);
      if (layout && sessionScrollViewRef.current) {
        sessionScrollViewRef.current.scrollTo({ x: layout.x - (screenWidth / 2) + (layout.width / 2), animated: true });
      }
    };

    return (
      <>
        <ScrollView
          ref={meetingScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={globalStyles.chipContainer}
        >
          {meetings.map(meeting => (
            <Pressable
              key={meeting.meeting_key}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                meetingLayouts.current.set(meeting.meeting_key, layout);
              }}
              onPress={() => handleMeetingPress(meeting.meeting_key)}
              style={[globalStyles.chip, selectedMeeting === meeting.meeting_key && globalStyles.chipSelected]}
            >
              <Text style={[globalStyles.chipText, selectedMeeting === meeting.meeting_key && globalStyles.chipTextSelected]}>
                {meeting.circuit_short_name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView
          ref={sessionScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={globalStyles.chipContainer}
        >
          {sessions.map(session => (
            <Pressable
              key={session.session_key}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                sessionLayouts.current.set(session.session_key, layout);
              }}
              onPress={() => handleSessionPress(session.session_key)}
              style={[globalStyles.chip, selectedSession === session.session_key && globalStyles.chipSelected]}
            >
              <Text style={[globalStyles.chipText, selectedSession === session.session_key && globalStyles.chipTextSelected]}>
                {session.session_name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['top']}>
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.driver_number.toString()}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={() => (
          <View style={globalStyles.center}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={globalStyles.messageText}>No results available for this session.</Text>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default ResultsScreen;