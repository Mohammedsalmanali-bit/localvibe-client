import axios from "axios";
import type { Event, User } from "@/types";

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>("/api/users/login", { email, password }),

  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/api/users/register", data),

  getProfile: () => api.get<User>("/api/users/profile"),

  updateProfile: (data: Partial<User>) =>
    api.put<User>("/api/users/profile", data),
};

export const eventsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<Event[]>("/api/events", { params }),

  getById: (id: string) => api.get<Event>(`/api/events/${id}`),

  create: (data: Partial<Event>) => api.post<Event>("/api/events", data),

  update: (id: string, data: Partial<Event>) =>
    api.put<Event>(`/api/events/${id}`, data),

  delete: (id: string) => api.delete(`/api/events/${id}`),

  getFeatured: () => api.get<Event[]>("/api/events", { params: { featured: "true" } }),

  getByCategory: (category: string) =>
    api.get<Event[]>("/api/events", { params: { category } }),

  getNearby: (lat: number, lng: number, radius?: number) =>
    api.get<Event[]>("/api/events", { params: { lat: String(lat), lng: String(lng), radius: String(radius || 10) } }),
};

export const rsvpApi = {
  rsvp: (eventId: string, status: "going" | "interested") =>
    api.post(`/api/rsvp/${eventId}`, { status }),

  cancelRsvp: (eventId: string) => api.delete(`/api/rsvp/${eventId}`),

  getMyRsvps: () => api.get<Event[]>("/api/rsvp"),
};

export default api;
