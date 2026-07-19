export interface Review {
  author: string;
  role: string;
  rating: number;
  text: string;
  date: string;
}

export interface Metrics {
  transportation: number;
  social: number;
  green_ratio: number;
  quietness: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  life_score: number;
  district_score: number; // District overall score
  avg_age_profile: string; // Age profile e.g. "Genç & Profesyonel (24-35)"
  grocery_access_profile: string; // e.g. "Çok Kolay (Yürüme 2 dk)"
  noise_level_profile: string; // e.g. "Düşük (Sakin Sokaklar)"
  metrics: Metrics;
  reviews: Review[];
}

export interface NeighborhoodSummary {
  neighborhood_id: string;
  summary: string;
  positive_tags: string[];
  negative_tags: string[];
  life_score: number;
}

export interface SyntheticPersona {
  persona_id: string;
  segment: string;
  age: number;
  occupation: string;
  priorities: string[];
  risk_tolerance?: string;
  budget_group?: string;
  description: string;
}

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}
