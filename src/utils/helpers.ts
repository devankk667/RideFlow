import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDistance(km: number | string): string {
  const val = Number(km) || 0;
  if (val < 1) {
    return `${Math.round(val * 1000)} m`;
  }
  return `${val.toFixed(1)} km`;
}

export function formatDuration(minutes: number | string): string {
  const val = Number(minutes) || 0;
  if (val < 60) {
    return `${Math.round(val)} min`;
  }
  const hours = Math.floor(val / 60);
  const mins = Math.round(val % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function calculateFare(distance: number, vehicleType: string): number {
  const baseFares: Record<string, number> = {
    bike: 15,
    auto: 25,
    car: 40,
    suv: 60,
    luxury: 100,
  };

  const perKmRates: Record<string, number> = {
    bike: 8,
    auto: 12,
    car: 15,
    suv: 20,
    luxury: 30,
  };

  const baseFare = baseFares[vehicleType] || 40;
  const perKmRate = perKmRates[vehicleType] || 15;

  return Math.round(baseFare + distance * perKmRate);
}

export function applyPromoDiscount(
  fare: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  maxDiscount?: number
): number {
  let discount = 0;

  if (discountType === 'percentage') {
    discount = (fare * discountValue) / 100;
    if (maxDiscount && discount > maxDiscount) {
      discount = maxDiscount;
    }
  } else {
    discount = discountValue;
  }

  return Math.min(discount, fare);
}

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}${timestamp}${randomStr}`;
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min: number, max: number, decimals: number = 2): number {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function playSound(soundName: string): void {
  try {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Silently fail if sound can't be played
    });
  } catch (error) {
    // Silently fail
  }
}

export function getVehicleIcon(vehicleType: string): string {
  const icons: Record<string, string> = {
    bike: '🏍️',
    auto: '🛺',
    car: '🚗',
    suv: '🚙',
    luxury: '🚘',
  };
  return icons[vehicleType] || '🚗';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'yellow',
    accepted: 'blue',
    driver_arriving: 'cyan',
    in_progress: 'green',
    completed: 'green',
    cancelled: 'red',
    no_driver_available: 'red',
  };
  return colors[status] || 'gray';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Searching for driver...',
    accepted: 'Driver Accepted',
    driver_arriving: 'Driver Arriving',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_driver_available: 'No Driver Available',
  };
  return labels[status] || status;
}

export function simulateLocationUpdate(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  progress: number // 0 to 1
): { lat: number; lng: number } {
  return {
    lat: start.lat + (end.lat - start.lat) * progress,
    lng: start.lng + (end.lng - start.lng) * progress,
  };
}
