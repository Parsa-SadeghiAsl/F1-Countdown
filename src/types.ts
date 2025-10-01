

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

// A processed, flattened event object for use in the UI
export interface ProcessedEvent {
  key: string; // Unique key for lists
  eventName: string; // e.g., "Practice 1", "Qualifying"
  raceName: string; // e.g., "Bahrain Grand Prix"
  dateTime: Date; // JavaScript Date object
}
