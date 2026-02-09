export interface EventLocation {
  address: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface EventOrganizer {
  id: string;
  name: string;
  email: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: EventLocation;
  price: number;
  currency: string;
  image: string;
  organizer: EventOrganizer;
  organizerName: string;
  isFeatured: boolean;
  maxAttendees: number;
  attendeeCount: number;
  goingCount: number;
  interestedCount: number;
  tags: string[];
  status: string;
  userRsvp?: "going" | "interested" | null;
}

export interface UserPreferences {
  categories: string[];
  radius: number;
}

export interface OrganizerProfile {
  bio: string;
  website: string;
  socialLinks: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  preferences: UserPreferences;
  isOrganizer: boolean;
  organizerProfile?: OrganizerProfile;
}

export const CATEGORIES = [
  "Music",
  "Food & Drink",
  "Markets",
  "Arts",
  "Sports",
  "Wellness",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface EventFiltersState {
  category: string;
  dateRange: string;
  priceRange: string;
  search: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  isLoading: boolean;
  error: string | null;
}
