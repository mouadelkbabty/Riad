export interface Photo {
  id: number;
  fileName: string;
  fileUrl: string;
  altText: string;
  caption?: string;
  displayOrder: number;
  coverPhoto: boolean;
  roomId?: number;
  uploadedAt: string;
}
