export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
}

export interface RaceEvent {
  date: string;
  time: string;
}

export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time: string;
  FirstPractice: RaceEvent;
  SecondPractice: RaceEvent;
  ThirdPractice?: RaceEvent; // Optional, as some weekends have Sprints
  Qualifying: RaceEvent;
  Sprint?: RaceEvent; // Optional for sprint race weekends
}

export interface RaceTable {
  season: string;
  Races: Race[];
}

export interface MRData {
  xmlns: string;
  series: string;
  url: string;
  limit: string;
  offset: string;
  total: string;
  RaceTable: RaceTable;
}

export interface ApiResponse {
  MRData: MRData;
}
