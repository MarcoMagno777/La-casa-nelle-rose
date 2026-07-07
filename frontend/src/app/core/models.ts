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

export interface AuthResponse {
  token: string;
  user: User;
}
