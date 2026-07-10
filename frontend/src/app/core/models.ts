export interface Furniture {
  id: number;
  name: string;
  description: string;
  placement: string;
  category: string;
  period: string;
  images: string[];
  liked?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface SiteSettings {
  homeHeroImage: string;
  catalogHeroImage: string;
}

export interface RealizationRoom {
  id: string;
  room: string;
  place: string;
  before: string;
  after: string;
  note: string;
}

export interface RealizationHouse {
  name: string;
  place: string;
  description: string;
  rooms: RealizationRoom[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
