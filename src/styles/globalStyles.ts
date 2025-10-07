import { StyleSheet } from 'react-native';
import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

export const colors = {
  background: '#121212', // Near black
  primary: '#E10600',    // F1 Red
  card: '#1e1e1e',       // Dark gray for cards
  text: '#FFFFFF',       // White text
  subtle: '#a1a1a1',      // Lighter gray for descriptions
  border: '#2a2a2a',      // Subtle border color
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    surface: colors.card,
    text: colors.text,
  },
};

export const globalStyles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // RaceListScreen styles
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 30,
    tintColor: colors.primary,
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text,
  },
  calendarCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: colors.card,
  },
  errorText: {
    color: colors.primary,
    fontSize: 16,
  },
  nextRaceCard: {
    marginHorizontal: 15,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  nextRaceSubheading: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
  },
  nextRaceTitle: {
    textAlign: 'center',
    color: colors.text,
    marginVertical: 5,
  },
  dateText: {
    textAlign: 'center',
    color: colors.subtle,
    marginBottom: 15,
    fontSize: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeBox: {
    alignItems: 'center',
  },
  countdownNumber: {
    color: colors.text,
    fontWeight: 'bold',
  },
  countdownLabel: {
    color: colors.subtle,
  },
  listHeader: {
    color: colors.text,
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  // LiveLeaderboardScreen styles
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
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    height: 60,
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
  },
  driverInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    color: colors.subtle,
    fontSize: 12,
  },
  timingInfo: {
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  gapText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  intervalText: {
    fontSize: 12,
    color: colors.subtle,
    marginTop: 2,
  },
  pointsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  // StandingsScreen styles
  segmentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 30,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    paddingHorizontal: 16,
  },
  chipContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chip: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    color: colors.subtle,
    fontWeight: 'bold',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTextSelected: {
    color: colors.text,
  },
});