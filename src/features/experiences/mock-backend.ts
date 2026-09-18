import { create } from 'zustand';

import type { ProfileKey } from '@/stores/use-auth-store';
import type {
  Category,
  Couple,
  Experience,
  ExperiencePhoto,
  ExperienceRatingEntry,
  NotificationSettings,
  Place,
} from '@/features/experiences/types';

// Stand-in "backend": the shape here matches supabase/migrations/0001_init.sql on purpose,
// so each hook in use-experiences.ts can be swapped for a real Supabase call later without
// changing any screen code.
interface AppDataState {
  couple: Couple;
  categories: Category[];
  places: Place[];
  experiences: Record<string, Experience>;
  notificationSettings: Record<ProfileKey, NotificationSettings>;

  createPlace: (input: Omit<Place, 'id'>) => Place;
  createIdea: (
    input: Pick<Experience, 'title' | 'description' | 'categoryId' | 'placeId' | 'budgetLevel' | 'createdBy'>,
  ) => Experience;
  updateExperience: (id: string, patch: Partial<Experience>) => void;
  discardIdea: (id: string) => void;
  convertIdeaToPlan: (id: string, input: { placeId: string; plannedAt: string }) => void;
  revertPlanToIdea: (id: string) => void;
  markCompleted: (id: string, input: { completedAt: string; placeId?: string }) => void;
  createCompletedDirectly: (
    input: Pick<Experience, 'title' | 'description' | 'categoryId' | 'placeId' | 'createdBy' | 'completedAt'>,
  ) => Experience;
  addPhoto: (experienceId: string, photo: Omit<ExperiencePhoto, 'id'>) => void;
  removePhoto: (experienceId: string, photoId: string) => void;
  setCoverPhoto: (experienceId: string, photoId: string) => void;
  submitRating: (experienceId: string, entry: ExperienceRatingEntry) => void;
  /** Dev-only stand-in for the partner rating arriving from another device. */
  simulatePartnerRating: (experienceId: string, partnerKey: ProfileKey) => void;
  updateCouple: (patch: Partial<Couple>) => void;
  updateNotificationSetting: (profile: ProfileKey, key: keyof NotificationSettings, value: boolean) => void;
}

let nextId = 100;
const genId = (prefix: string) => `${prefix}-${nextId++}`;

// Ciudad de Guatemala as the base city, matching the couple's `base_city` seed.
const CATEGORIES: Category[] = [
  { id: 'cat-comida', name: 'Comida', icon: 'restaurant', color: '#e50066' },
  { id: 'cat-aventura', name: 'Aventura', icon: 'hiking', color: '#aa2d32' },
  { id: 'cat-cultura', name: 'Cultura', icon: 'theater-comedy', color: '#910030' },
  { id: 'cat-relax', name: 'Relax', icon: 'spa', color: '#cc4548' },
  { id: 'cat-sorpresa', name: 'Sorpresa', icon: 'auto-awesome', color: '#b90040' },
];

const PLACES: Place[] = [
  {
    id: 'place-casa-escobar',
    name: 'Casa Escobar',
    city: 'Ciudad de Guatemala',
    country: 'Guatemala',
    latitude: 14.6017,
    longitude: -90.5133,
    locationType: 'exact',
  },
  {
    id: 'place-parque-central',
    name: 'Parque Central',
    city: 'Ciudad de Guatemala',
    country: 'Guatemala',
    latitude: 14.6407,
    longitude: -90.5133,
    locationType: 'exact',
  },
  {
    id: 'place-mirador',
    name: 'Mirador de la Ciudad',
    city: 'Ciudad de Guatemala',
    country: 'Guatemala',
    latitude: 14.6139,
    longitude: -90.4964,
    locationType: 'approximate',
  },
];

const EXPERIENCES: Experience[] = [
  {
    id: 'casa-escobar-aniversario',
    title: 'Cena de Aniversario',
    status: 'completed',
    categoryId: 'cat-comida',
    placeId: 'place-casa-escobar',
    createdBy: 'yesica',
    completedAt: '2024-11-18',
    photos: [
      {
        id: 'photo-1',
        uri: 'https://lh3.googleusercontent.com/aida/AEtjO1U0jOOnLtz7FUmEnOwSAfR9vatvDYQlI3M7sQJzJ8f4lQW0A6DJMbpsL_ZkgDII23z8PA7CH9YQVnM80RqJAZvcK7PJqq3_h5q83-vAUOwyhKhglAOKRquv_Okn6ZQv8FZEur4IN39OaH_lvsQh0q8ZIMvLkJtxQ1OTxOKP-nsv-HN_NSANE67uqxvTMnH6GkMiBwl_Nb3K93k6nooCFp1p4bMfeWZrcmsQeEsya20UDRC6PisFn3sFFagv',
        uploadedBy: 'yesica',
      },
    ],
    ratings: [
      {
        profileKey: 'yesica',
        score: 5,
        comment: 'Inolvidable, la mejor pasta que hemos probado y el tiramisú de ensueño',
        submittedAt: '2024-11-18T22:14:00.000Z',
      },
    ],
    createdAt: '2024-11-10T18:00:00.000Z',
  },
  {
    id: 'parque-tarde-picnic',
    title: 'Picnic en el parque',
    status: 'completed',
    categoryId: 'cat-relax',
    placeId: 'place-parque-central',
    createdBy: 'fabian',
    completedAt: '2024-08-02',
    photos: [],
    ratings: [
      { profileKey: 'yesica', score: 4.5, submittedAt: '2024-08-02T20:00:00.000Z' },
      { profileKey: 'fabian', score: 4.5, submittedAt: '2024-08-02T20:05:00.000Z' },
    ],
    createdAt: '2024-07-28T12:00:00.000Z',
  },
  {
    id: 'cine-bajo-estrellas',
    title: 'Cine bajo las estrellas',
    status: 'planned',
    categoryId: 'cat-cultura',
    placeId: 'place-mirador',
    createdBy: 'fabian',
    plannedAt: '2026-09-30',
    photos: [],
    ratings: [],
    createdAt: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'picnic-sorpresa-idea',
    title: 'Picnic sorpresa',
    description: 'Sorprenderla con un picnic en un lugar nuevo que no hayamos visitado.',
    status: 'idea',
    categoryId: 'cat-sorpresa',
    createdBy: 'fabian',
    photos: [],
    ratings: [],
    createdAt: '2026-09-12T09:00:00.000Z',
  },
];

export const useAppDataStore = create<AppDataState>((set, get) => ({
  couple: {
    name: 'Yesica & Fabián',
    relationshipStartedOn: '2022-02-14',
    baseCity: 'Ciudad de Guatemala',
  },
  categories: CATEGORIES,
  places: PLACES,
  experiences: Object.fromEntries(EXPERIENCES.map((e) => [e.id, e])),
  notificationSettings: {
    yesica: {
      newPlan: true,
      planChanged: true,
      experienceCompleted: true,
      ratingRequested: true,
      ratingRevealed: true,
    },
    fabian: {
      newPlan: true,
      planChanged: true,
      experienceCompleted: true,
      ratingRequested: true,
      ratingRevealed: true,
    },
  },

  createPlace: (input) => {
    const place: Place = { ...input, id: genId('place') };
    set((state) => ({ places: [...state.places, place] }));
    return place;
  },

  createIdea: (input) => {
    const experience: Experience = {
      ...input,
      id: genId('experience'),
      status: 'idea',
      photos: [],
      ratings: [],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ experiences: { ...state.experiences, [experience.id]: experience } }));
    return experience;
  },

  updateExperience: (id, patch) =>
    set((state) => {
      const experience = state.experiences[id];
      if (!experience) return state;
      return { experiences: { ...state.experiences, [id]: { ...experience, ...patch } } };
    }),

  discardIdea: (id) => get().updateExperience(id, { status: 'discarded' }),

  convertIdeaToPlan: (id, { placeId, plannedAt }) =>
    get().updateExperience(id, { status: 'planned', placeId, plannedAt }),

  revertPlanToIdea: (id) => get().updateExperience(id, { status: 'idea', plannedAt: undefined }),

  markCompleted: (id, { completedAt, placeId }) =>
    get().updateExperience(id, {
      status: 'completed',
      completedAt,
      ...(placeId ? { placeId } : {}),
    }),

  createCompletedDirectly: (input) => {
    const experience: Experience = {
      ...input,
      id: genId('experience'),
      status: 'completed',
      photos: [],
      ratings: [],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ experiences: { ...state.experiences, [experience.id]: experience } }));
    return experience;
  },

  addPhoto: (experienceId, photo) =>
    set((state) => {
      const experience = state.experiences[experienceId];
      if (!experience) return state;
      const newPhoto: ExperiencePhoto = { ...photo, id: genId('photo') };
      const photos = [...experience.photos, newPhoto];
      return {
        experiences: {
          ...state.experiences,
          [experienceId]: {
            ...experience,
            photos,
            coverPhotoId: experience.coverPhotoId ?? newPhoto.id,
          },
        },
      };
    }),

  removePhoto: (experienceId, photoId) =>
    set((state) => {
      const experience = state.experiences[experienceId];
      if (!experience) return state;
      const photos = experience.photos.filter((p) => p.id !== photoId);
      const coverPhotoId = experience.coverPhotoId === photoId ? photos[0]?.id : experience.coverPhotoId;
      return { experiences: { ...state.experiences, [experienceId]: { ...experience, photos, coverPhotoId } } };
    }),

  setCoverPhoto: (experienceId, photoId) => get().updateExperience(experienceId, { coverPhotoId: photoId }),

  submitRating: (experienceId, entry) =>
    set((state) => {
      const experience = state.experiences[experienceId];
      if (!experience) return state;
      const ratings = experience.ratings.filter((r) => r.profileKey !== entry.profileKey);
      ratings.push(entry);
      return { experiences: { ...state.experiences, [experienceId]: { ...experience, ratings } } };
    }),

  simulatePartnerRating: (experienceId, partnerKey) =>
    set((state) => {
      const experience = state.experiences[experienceId];
      if (!experience) return state;
      const ratings = experience.ratings.filter((r) => r.profileKey !== partnerKey);
      ratings.push({
        profileKey: partnerKey,
        score: 4.8,
        comment: 'Atmósfera mágica a la luz de las velas y la mejor compañía del mundo',
        submittedAt: new Date().toISOString(),
      });
      return { experiences: { ...state.experiences, [experienceId]: { ...experience, ratings } } };
    }),

  updateCouple: (patch) => set((state) => ({ couple: { ...state.couple, ...patch } })),

  updateNotificationSetting: (profile, key, value) =>
    set((state) => ({
      notificationSettings: {
        ...state.notificationSettings,
        [profile]: { ...state.notificationSettings[profile], [key]: value },
      },
    })),
}));
