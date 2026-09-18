import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppDataStore } from '@/features/experiences/mock-backend';
import type {
  Couple,
  Experience,
  ExperiencePhoto,
  ExperienceRatingEntry,
  ExperienceStatus,
  NotificationSettings,
  Place,
} from '@/features/experiences/types';
import { sendLocalNotification } from '@/services/notifications';
import type { ProfileKey } from '@/stores/use-auth-store';

// Simulates network latency, same as a real Supabase round trip would have.
function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// There's no push server yet (plan §5.12/Fase 11), so this fires a local notification on this
// same device per enabled recipient, as a stand-in for what a real push would deliver to them.
function notifyIfEnabled(key: keyof NotificationSettings, title: string, body: string) {
  const settings = useAppDataStore.getState().notificationSettings;
  (Object.keys(settings) as ProfileKey[]).forEach((profile) => {
    if (settings[profile][key]) sendLocalNotification(title, body);
  });
}

const KEY = {
  experiences: ['experiences'] as const,
  experience: (id: string) => ['experiences', id] as const,
  places: ['places'] as const,
  categories: ['categories'] as const,
  couple: ['couple'] as const,
};

function useInvalidateAppData() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [], exact: false });
}

export function useExperiences(status?: ExperienceStatus) {
  const experiences = useAppDataStore((state) => Object.values(state.experiences));
  return useQuery<Experience[]>({
    queryKey: [...KEY.experiences, status ?? 'all'],
    queryFn: () => delay(status ? experiences.filter((e) => e.status === status) : experiences),
  });
}

export function useExperience(id: string) {
  const experience = useAppDataStore((state) => state.experiences[id]);
  return useQuery<Experience | undefined>({
    queryKey: KEY.experience(id),
    queryFn: () => delay(experience),
  });
}

export function usePlaces() {
  const places = useAppDataStore((state) => state.places);
  return useQuery<Place[]>({ queryKey: KEY.places, queryFn: () => delay(places) });
}

export function usePlace(id: string | undefined) {
  const place = useAppDataStore((state) => state.places.find((p) => p.id === id));
  return useQuery<Place | undefined>({
    queryKey: ['places', id],
    queryFn: () => delay(place),
    enabled: !!id,
  });
}

export function useCategories() {
  const categories = useAppDataStore((state) => state.categories);
  return useQuery({ queryKey: KEY.categories, queryFn: () => delay(categories) });
}

export function useCouple() {
  const couple = useAppDataStore((state) => state.couple);
  return useQuery<Couple>({ queryKey: KEY.couple, queryFn: () => delay(couple) });
}

export function useNotificationSettings(profile: ProfileKey) {
  const settings = useAppDataStore((state) => state.notificationSettings[profile]);
  return useQuery<NotificationSettings>({
    queryKey: ['notification-settings', profile],
    queryFn: () => delay(settings),
  });
}

export function useCreatePlace() {
  const invalidate = useInvalidateAppData();
  const createPlace = useAppDataStore((state) => state.createPlace);
  return useMutation({
    mutationFn: (input: Omit<Place, 'id'>) => delay(createPlace(input)),
    onSuccess: invalidate,
  });
}

export function useCreateIdea() {
  const invalidate = useInvalidateAppData();
  const createIdea = useAppDataStore((state) => state.createIdea);
  return useMutation({
    mutationFn: (input: Parameters<typeof createIdea>[0]) => delay(createIdea(input)),
    onSuccess: invalidate,
  });
}

export function useUpdateExperience() {
  const invalidate = useInvalidateAppData();
  const updateExperience = useAppDataStore((state) => state.updateExperience);
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Experience> }) => delay(updateExperience(id, patch)),
    onSuccess: invalidate,
  });
}

export function useDiscardIdea() {
  const invalidate = useInvalidateAppData();
  const discardIdea = useAppDataStore((state) => state.discardIdea);
  return useMutation({ mutationFn: (id: string) => delay(discardIdea(id)), onSuccess: invalidate });
}

export function useConvertIdeaToPlan() {
  const invalidate = useInvalidateAppData();
  const convertIdeaToPlan = useAppDataStore((state) => state.convertIdeaToPlan);
  return useMutation({
    mutationFn: ({ id, placeId, plannedAt }: { id: string; placeId: string; plannedAt: string }) =>
      delay(convertIdeaToPlan(id, { placeId, plannedAt })),
    onSuccess: invalidate,
  });
}

export function useRevertPlanToIdea() {
  const invalidate = useInvalidateAppData();
  const revertPlanToIdea = useAppDataStore((state) => state.revertPlanToIdea);
  return useMutation({ mutationFn: (id: string) => delay(revertPlanToIdea(id)), onSuccess: invalidate });
}

export function useMarkCompleted() {
  const invalidate = useInvalidateAppData();
  const markCompleted = useAppDataStore((state) => state.markCompleted);
  return useMutation({
    mutationFn: ({ id, completedAt, placeId }: { id: string; completedAt: string; placeId?: string }) =>
      delay(markCompleted(id, { completedAt, placeId })),
    onSuccess: (_data, variables) => {
      invalidate();
      const experience = useAppDataStore.getState().experiences[variables.id];
      if (experience) {
        notifyIfEnabled(
          'ratingRequested',
          'Ya pueden calificarla 💌',
          `"${experience.title}" quedó marcada como realizada.`,
        );
      }
    },
  });
}

export function useCreateCompletedDirectly() {
  const invalidate = useInvalidateAppData();
  const createCompletedDirectly = useAppDataStore((state) => state.createCompletedDirectly);
  return useMutation({
    mutationFn: (input: Parameters<typeof createCompletedDirectly>[0]) => delay(createCompletedDirectly(input)),
    onSuccess: invalidate,
  });
}

export function useAddPhoto(experienceId: string) {
  const invalidate = useInvalidateAppData();
  const addPhoto = useAppDataStore((state) => state.addPhoto);
  return useMutation({
    mutationFn: (photo: Omit<ExperiencePhoto, 'id'>) => delay(addPhoto(experienceId, photo)),
    onSuccess: invalidate,
  });
}

export function useRemovePhoto(experienceId: string) {
  const invalidate = useInvalidateAppData();
  const removePhoto = useAppDataStore((state) => state.removePhoto);
  return useMutation({
    mutationFn: (photoId: string) => delay(removePhoto(experienceId, photoId)),
    onSuccess: invalidate,
  });
}

export function useSetCoverPhoto(experienceId: string) {
  const invalidate = useInvalidateAppData();
  const setCoverPhoto = useAppDataStore((state) => state.setCoverPhoto);
  return useMutation({
    mutationFn: (photoId: string) => delay(setCoverPhoto(experienceId, photoId)),
    onSuccess: invalidate,
  });
}

function notifyIfJustRevealed(experienceId: string) {
  const experience = useAppDataStore.getState().experiences[experienceId];
  if (experience?.ratings.length === 2) {
    notifyIfEnabled(
      'ratingRevealed',
      '¡Puntuaciones reveladas! ✨',
      `Ya pueden ver cómo calificaron "${experience.title}".`,
    );
  }
}

export function useSubmitRating(experienceId: string) {
  const invalidate = useInvalidateAppData();
  const submitRating = useAppDataStore((state) => state.submitRating);
  return useMutation({
    mutationFn: (entry: ExperienceRatingEntry) => delay(submitRating(experienceId, entry)),
    onSuccess: () => {
      invalidate();
      notifyIfJustRevealed(experienceId);
    },
  });
}

export function useSimulatePartnerRating(experienceId: string) {
  const invalidate = useInvalidateAppData();
  const simulatePartnerRating = useAppDataStore((state) => state.simulatePartnerRating);
  return useMutation({
    mutationFn: (partnerKey: ProfileKey) => delay(simulatePartnerRating(experienceId, partnerKey)),
    onSuccess: () => {
      invalidate();
      notifyIfJustRevealed(experienceId);
    },
  });
}

export function useUpdateCouple() {
  const invalidate = useInvalidateAppData();
  const updateCouple = useAppDataStore((state) => state.updateCouple);
  return useMutation({
    mutationFn: (patch: Partial<Couple>) => delay(updateCouple(patch)),
    onSuccess: invalidate,
  });
}

export function useUpdateNotificationSetting(profile: ProfileKey) {
  const invalidate = useInvalidateAppData();
  const updateNotificationSetting = useAppDataStore((state) => state.updateNotificationSetting);
  return useMutation({
    mutationFn: ({ key, value }: { key: keyof NotificationSettings; value: boolean }) =>
      delay(updateNotificationSetting(profile, key, value)),
    onSuccess: invalidate,
  });
}
