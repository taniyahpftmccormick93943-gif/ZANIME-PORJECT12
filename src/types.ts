export interface Episode {
  id: string;
  title: string;
  duration?: string;
  server1Url?: string;
  server2Url?: string;
  order: number;
  seasonId?: string;
}

export interface Season {
  id: string;
  number: number;
  title?: string;
  imageUrl?: string;
  episodes?: Episode[];
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  year: number;
  rating: number;
  duration: string;
  genre: string[];
  imageUrl: string;
  backdropUrl: string;
  isNew?: boolean;
  isTrending?: boolean;
  isBanner?: boolean;
  isPro?: boolean;
  seasonsCount?: number;
  status?: 'Ongoing' | 'Finished';
  endYear?: string;
  server1Url?: string;
  server2Url?: string;
}

export interface Review {
  id: string;
  movieId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AppSettings {
  telegramLink: string;
  plan_1day: number;
  plan_1month: number;
  plan_3months: number;
  plan_6months: number;
  plan_1year: number;
}

export interface UserData {
  id: string;
  name?: string;
  email: string;
  role: 'User' | 'Admin' | 'Owner';
  status: 'Active' | 'Banned';
  subscriptionPlan?: 'none' | '1day' | '1month' | '3months' | '6months' | '1year';
  subscriptionExpiry?: string;
}

export interface Category {
  id: string;
  name: string;
  movies: Movie[];
}
