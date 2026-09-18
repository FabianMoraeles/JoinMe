import type { ProfileKey } from '@/stores/use-auth-store';

export type ExperienceStatus = 'idea' | 'planned' | 'completed' | 'discarded';
export type LocationType = 'exact' | 'approximate' | 'home' | 'remote' | 'none';
export type BudgetLevel = 1 | 2 | 3;

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Place {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  locationType: LocationType;
}

export interface ExperiencePhoto {
  id: string;
  /** Path inside the private `experience-photos` Storage bucket — resolve a displayable URL
   * with useSignedPhotoUrl() rather than rendering this directly. */
  storagePath: string;
  /** profiles.id of whoever uploaded it — opaque; nothing renders this, so it's never mapped
   * back to a ProfileKey. */
  uploadedBy: string;
}

export interface ExperienceRatingEntry {
  profileKey: ProfileKey;
  score: number; // 1-5
  submittedAt: string; // ISO timestamp
}

export interface Experience {
  id: string;
  title: string;
  description?: string;
  status: ExperienceStatus;
  categoryId?: string;
  placeId?: string;
  /** profiles.id of whoever created it — opaque, same reasoning as ExperiencePhoto.uploadedBy. */
  createdBy: string;
  plannedAt?: string; // AAAA-MM-DD
  completedAt?: string; // AAAA-MM-DD
  budgetLevel?: BudgetLevel;
  photos: ExperiencePhoto[];
  coverPhotoId?: string;
  ratings: ExperienceRatingEntry[];
  createdAt: string;
}

export type RatingStatus = 'awaiting-self' | 'awaiting-partner' | 'revealed';

export function getRatingStatus(experience: Experience, viewer: ProfileKey): RatingStatus {
  const viewerRated = experience.ratings.some((r) => r.profileKey === viewer);
  const bothRated = experience.ratings.length === 2;
  if (bothRated) return 'revealed';
  if (viewerRated) return 'awaiting-partner';
  return 'awaiting-self';
}

export interface Couple {
  name: string;
  photoUrl?: string;
  relationshipStartedOn?: string; // AAAA-MM-DD
  baseCity?: string;
}

export interface NotificationSettings {
  newPlan: boolean;
  planChanged: boolean;
  experienceCompleted: boolean;
  ratingRequested: boolean;
  ratingRevealed: boolean;
}
