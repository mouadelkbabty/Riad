export type RoomType = 'STANDARD' | 'SUPERIOR' | 'SUITE' | 'SUITE_ROYALE' | 'RIAD_ENTIER';

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  STANDARD: 'Chambre Standard',
  SUPERIOR: 'Chambre Supérieure',
  SUITE: 'Suite',
  SUITE_ROYALE: 'Suite Royale',
  RIAD_ENTIER: 'Riad Entier',
};

export interface RoomPhoto {
  id: number;
  fileUrl: string;
  altText: string;
  caption?: string;
  coverPhoto: boolean;
  displayOrder: number;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  descriptionFr?: string;
  descriptionAr?: string;
  type: RoomType;
  typeName: string;
  pricePerNight: number;
  capacity: number;
  surface: number;
  available: boolean;
  amenities: string[];
  photos: RoomPhoto[];
  coverPhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomFilter {
  type?: RoomType;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export interface RoomRequest {
  name: string;
  description: string;
  descriptionFr?: string;
  descriptionAr?: string;
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  surface: number;
  available: boolean;
  amenities: string[];
}
