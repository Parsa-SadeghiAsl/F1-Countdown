// Represents a single session's date string
export type SessionDate = string;

// Represents all possible sessions for a race weekend
export interface Sessions {
  fp1?: SessionDate;
  fp2?: SessionDate;
  fp3?: SessionDate;
  sprintQualifying?: SessionDate;
  qualifying?: SessionDate;
  sprint?: SessionDate;
  gp: SessionDate; // The main race is 'gp'
}

// Represents a single race event from the new API
export interface F1RaceEvent {
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  round: number;
  slug: string;
  localeKey: string;
  sessions: Sessions;
}

// Represents the entire API response
export interface F1APIResponse {
  races: F1RaceEvent[];
}

export interface ProcessedEvent {
  key: string; // Unique key for lists
  eventName: string; // e.g., "Practice 1", "Qualifying"
  raceName: string; // e.g., "Bahrain Grand Prix"
  dateTime: Date; // JavaScript Date object
}

// --- Interfaces for Standings ---

export interface Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  givenName: string;
  familyName: string;
  nationality: string;
}

export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

interface StandingsList<T> {
  season: string;
  round: string;
  DriverStandings?: T[];
  ConstructorStandings?: T[];
}

interface StandingsTable<T> {
  season: string;
  StandingsLists: StandingsList<T>[];
}

interface MRData<T> {
  StandingsTable: StandingsTable<T>;
}

export interface DriverStandingsResponse {
  MRData: MRData<DriverStanding>;
}

export interface ConstructorStandingsResponse {
  MRData: MRData<ConstructorStanding>;
}

// --- Interfaces for Live Leaderboard ---

export interface LiveSession {
  session_key: number;
  session_name: string;
  meeting_key: number;
  date_start: string;
  date_end: string;
  isLive?: boolean;
  circuit_short_name: string;
}

export interface LiveDriver {
  driver_number: number;
  full_name: string;
  team_name: string;
  team_colour: string;
  headshot_url: string;
}

export interface LivePosition {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  date: string;
  position: number;
}

export interface LiveInterval {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  date: string;
  gap_to_leader?: string;
  interval?: string;
}

export interface LiveSessionResult {
  session_key: number;
  driver_number: number;
  position: number;
  status: string;
  points?: number;
  time?: number;
  best_lap_time?: number;
  duration: any;
  dnf: boolean;
  dsq: boolean;
  dns: boolean;
}

export interface LeaderboardEntry {
  driver_number: number;
  full_name: string;
  team_name: string;
  team_colour: string;
  headshot_url: string;
  position: number;
  gap_to_leader?: string;
  interval?: string;
  status?: string;
  points?: number;
  display_time?: string;
}

