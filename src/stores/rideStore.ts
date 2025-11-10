import { create } from 'zustand';
import type { Ride, Location, VehicleType } from '../types';
import { rides as mockRides } from '../data/mockData';

interface RideState {
  rides: Ride[];
  currentRide: Ride | null;
  bookingData: {
    pickup?: Location;
    destination?: Location;
    vehicleType?: VehicleType;
    scheduledTime?: string;
  };
  
  setBookingData: (data: Partial<RideState['bookingData']>) => void;
  createRide: (ride: Omit<Ride, 'id' | 'status' | 'createdAt'>) => Ride;
  updateRide: (rideId: string, data: Partial<Ride>) => void;
  setCurrentRide: (ride: Ride | null) => void;
  getRideById: (rideId: string) => Ride | undefined;
  getUserRides: (userId: string) => Ride[];
  getDriverRides: (driverId: string) => Ride[];
}

export const useRideStore = create<RideState>((set, get) => ({
  rides: [...mockRides],
  currentRide: null,
  bookingData: {},

  setBookingData: (data) => {
    set((state) => ({
      bookingData: { ...state.bookingData, ...data },
    }));
  },

  createRide: (rideData) => {
    const newRide: Ride = {
      ...rideData,
      id: `ride_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      rides: [newRide, ...state.rides],
      currentRide: newRide,
    }));

    return newRide;
  },

  updateRide: (rideId, data) => {
    set((state) => ({
      rides: state.rides.map((ride) =>
        ride.id === rideId ? { ...ride, ...data } : ride
      ),
      currentRide:
        state.currentRide?.id === rideId
          ? { ...state.currentRide, ...data }
          : state.currentRide,
    }));
  },

  setCurrentRide: (ride) => {
    set({ currentRide: ride });
  },

  getRideById: (rideId) => {
    return get().rides.find((ride) => ride.id === rideId);
  },

  getUserRides: (userId) => {
    return get().rides.filter((ride) => ride.passengerId === userId);
  },

  getDriverRides: (driverId) => {
    return get().rides.filter((ride) => ride.driverId === driverId);
  },
}));
