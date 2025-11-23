import { create } from 'zustand';
import type { Ride } from '../types';
import { API_URL } from '../config/api';
import { useAuthStore } from './authStore';

interface RideState {
  rides: Ride[];
  currentRide: Ride | null;
  bookingData: {
    pickup?: any;
    destination?: any;
    vehicleType?: string;
    scheduledTime?: string;
  };

  setBookingData: (data: Partial<RideState['bookingData']>) => void;
  createRide: (ride: any) => Promise<Ride | undefined>;
  updateRide: (rideId: string, data: Partial<Ride>) => Promise<void>;
  setCurrentRide: (ride: Ride | null) => void;
  getRideById: (rideId: string) => Ride | undefined;
  getUserRides: (userId: string) => Promise<Ride[]>;
  getDriverRides: (driverId: string) => Ride[];
}

export const useRideStore = create<RideState>((set, get) => ({
  rides: [],
  currentRide: null,
  bookingData: {},

  setBookingData: (data) => {
    set((state) => ({
      bookingData: { ...state.bookingData, ...data },
    }));
  },

  createRide: async (rideData) => {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rideData),
      });

      const newRide = await response.json();

      if (response.ok) {
        set((state) => ({
          rides: [newRide, ...state.rides],
          currentRide: newRide,
        }));
        return newRide;
      }
    } catch (error) {
      console.error('Create ride error:', error);
    }
  },

  updateRide: async (rideId, data) => {
    try {
      const token = useAuthStore.getState().token;
      await fetch(`${API_URL}/rides/${rideId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      set((state) => ({
        rides: state.rides.map((ride) =>
          ride.id === rideId ? { ...ride, ...data } : ride
        ),
        currentRide:
          state.currentRide?.id === rideId
            ? { ...state.currentRide, ...data }
            : state.currentRide,
      }));
    } catch (error) {
      console.error('Update ride error:', error);
    }
  },

  setCurrentRide: (ride) => {
    set({ currentRide: ride });
  },

  getRideById: (rideId) => {
    return get().rides.find((ride) => ride.id === rideId);
  },

  getUserRides: async (userId) => {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/passengers/rides`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const rides = await response.json();
      if (response.ok) {
        set({ rides });
        return rides;
      }
      return [];
    } catch (error) {
      console.error('Get user rides error:', error);
      return [];
    }
  },

  getDriverRides: (driverId) => {
    return get().rides.filter((ride) => ride.driverId === driverId);
  },
}));
