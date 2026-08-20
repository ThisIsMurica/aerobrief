export interface WindData {
  direction: string;
  speed: number;
  gust?: number | null;
}

export interface CloudLayer {
  coverage: string;
  altitude: number;
  isCb: boolean;
}

export interface MetarData {
  raw: string;
  station: string;
  observationTime: string;
  wind: WindData;
  visibility: string;
  weather: string[];
  clouds: CloudLayer[];
  temperature: number;
  dewpoint: number;
  altimeter: string;
  remarks?: string | null;
}

export interface MetarDataResponse {
  isValidIcao: boolean;
  errorMessage: string | null;
  metar: MetarData | null;
}

export interface AirportInsight {
  elevation: string;
  weatherAdvisory: string;
  runwayRecommendation: {
    runway: string;
    justification: string;
  };
  airportTip: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface WindComponent {
  crosswind: number;
  crosswindDirection: 'Left' | 'Right' | null;
  headwind: number; // Positive for headwind, negative for tailwind
}