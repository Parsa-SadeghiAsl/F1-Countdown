import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Image, Modal, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Card, Text, Button, Divider, Portal } from 'react-native-paper';
import { getMeetings, getSessions, getDrivers, getSessionResults } from '../services/API';
import { LiveSession, LiveDriver, LeaderboardEntry, LiveSessionResult, Meeting } from '../types';
import { colors, globalStyles } from '../styles/globalStyles';

const ResultsScreen = (): React.JSX.Element => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [drivers, setDrivers] = useState<Map<number, LiveDriver>>(new Map());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);

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
          setSelectedMeeting(lastMeeting);
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
        const sessionsData = await getSessions(selectedMeeting.meeting_key);
        setSessions(sessionsData);
        if (sessionsData.length > 0) {
          const lastSession = sessionsData.find(s => s.session_name === 'Race') || sessionsData[sessionsData.length - 1];
          setSelectedSession(lastSession);
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
          const driverData = await getDrivers(selectedSession.session_key);
          const driverMap = new Map<number, LiveDriver>(driverData.map(d => [d.driver_number, d]));
          setDrivers(driverMap);

          const results = await getSessionResults(selectedSession.session_key);
          setLeaderboard(processSessionResultsData(driverMap, results, selectedSession?.session_name || ''));
        } catch (err) {
          setError('Could not load session results.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [selectedSession, processSessionResultsData]);

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
    return (
      <View style={{ padding: 16 }}>
        <Button
          onPress={() => setMeetingModalVisible(true)}
          mode="outlined"
          style={{ marginBottom: 10, borderColor: colors.primary }}
          textColor={colors.text}
        >
          {selectedMeeting ? selectedMeeting.meeting_name : "Select a Meeting"}
        </Button>
        <Button
          onPress={() => setSessionModalVisible(true)}
          mode="outlined"
          textColor={colors.text}
          style={{ borderColor: colors.primary }}
        >
          {selectedSession ? selectedSession.session_name : "Select a Session"}
        </Button>
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['top']}>
      <Portal>
        <Modal
          visible={meetingModalVisible}
          onDismiss={() => setMeetingModalVisible(false)}
          transparent={true}
          animationType="fade"
          navigationBarTranslucent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {meetings.map((meeting, index) => (
                  <View key={meeting.meeting_key}>
                    <Pressable
                      onPress={() => {
                        setSelectedMeeting(meeting);
                        setMeetingModalVisible(false);
                      }}
                      style={styles.modalItem}
                    >
                      <Text style={styles.modalItemText}>{meeting.meeting_name}</Text>
                    </Pressable>
                    {index < meetings.length - 1 && <Divider style={{ backgroundColor: colors.border }} />}
                  </View>
                ))}
              </ScrollView>
              <Button onPress={() => setMeetingModalVisible(false)} textColor={colors.primary} style={{marginTop: 10}}>Close</Button>
            </View>
          </View>
        </Modal>
        <Modal
          visible={sessionModalVisible}
          onDismiss={() => setSessionModalVisible(false)}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {sessions.map((session, index) => (
                  <View key={session.session_key}>
                    <Pressable
                      onPress={() => {
                        setSelectedSession(session);
                        setSessionModalVisible(false);
                      }}
                      style={styles.modalItem}
                    >
                      <Text style={styles.modalItemText}>{session.session_name}</Text>
                    </Pressable>
                    {index < sessions.length - 1 && <Divider style={{ backgroundColor: colors.border }} />}
                  </View>
                ))}
              </ScrollView>
              <Button onPress={() => setSessionModalVisible(false)} textColor={colors.primary} style={{marginTop: 10}}>Close</Button>
            </View>
          </View>
        </Modal>
      </Portal>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
  },
  modalItem: {
    paddingVertical: 15,
  },
  modalItemText: {
    color: colors.text,
    fontSize: 16,
  },
});

export default ResultsScreen;