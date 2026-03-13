export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export const RESERVATION_STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; badgeClass: string }
> = {
  PENDING:   { label: 'En attente',  badgeClass: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmée',   badgeClass: 'badge-green'  },
  CANCELLED: { label: 'Annulée',     badgeClass: 'badge-red'    },
  COMPLETED: { label: 'Terminée',    badgeClass: 'badge-blue'   },
  NO_SHOW:   { label: 'Non présenté', badgeClass: 'badge-gray'  },
};

export interface Reservation {
  id: number;
  reservationNumber: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
  };
  room: {
    id: number;
    name: string;
    type: string;
    coverPhotoUrl?: string;
  };
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  numberOfNights: number;
  totalPrice: number;
  status: ReservationStatus;
  specialRequests?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface ReservationRequest {
  roomId: number;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface GuestReservationRequest {
  roomId: number;
  fullName: string;
  email: string;
  phone: string;
  numberOfGuests: number;
  checkIn: string;
  checkOut: string;
  message?: string;
}

export interface CancelReservationRequest {
  reason: string;
}

export interface OccupiedDateRange {
  checkIn: string;
  checkOut: string;
}
