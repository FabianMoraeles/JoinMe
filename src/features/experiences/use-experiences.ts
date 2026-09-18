import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  BudgetLevel,
  Category,
  Couple,
  Experience,
  ExperienceStatus,
  NotificationSettings,
  Place,
} from '@/features/experiences/types';
import { sendLocalNotification } from '@/services/notifications';
import { supabase } from '@/services/supabase/client';
import { useAuthStore, type ProfileKey } from '@/stores/use-auth-store';

// `experiences` has two FKs to experience_photos (experience_id, and cover_photo_id going the
// other way), so PostgREST can't infer which one a bare `experience_photos(*)` means — this
// silently failed every read (HTTP 300, ambiguous embed) until the FK name pinned it down.
const EXPERIENCE_SELECT =
  '*, experience_photos!experience_photos_experience_id_fkey(*), ratings(*, profiles(fixed_profile_key))';

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  newPlan: true,
  planChanged: true,
  experienceCompleted: true,
  ratingRequested: true,
  ratingRevealed: true,
};

function toDateOnly(value: string | null | undefined): string | undefined {
  return value ? value.slice(0, 10) : undefined;
}

// Raw shapes as PostgREST returns them (snake_case + embedded resources) — kept private to this
// file; every hook below returns the camelCase domain types from ./types.
interface ExperiencePhotoRow {
  id: string;
  storage_path: string;
  uploaded_by_profile_id: string;
}

interface RatingRow {
  score: number;
  created_at: string;
  profiles: { fixed_profile_key: ProfileKey } | null;
}

interface ExperienceRow {
  id: string;
  title: string;
  description: string | null;
  status: ExperienceStatus;
  category_id: string | null;
  place_id: string | null;
  created_by_profile_id: string;
  planned_at: string | null;
  completed_at: string | null;
  budget_level: BudgetLevel | null;
  cover_photo_id: string | null;
  created_at: string;
  experience_photos: ExperiencePhotoRow[] | null;
  ratings: RatingRow[] | null;
}

function mapExperienceRow(row: ExperienceRow): Experience {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    categoryId: row.category_id ?? undefined,
    placeId: row.place_id ?? undefined,
    createdBy: row.created_by_profile_id,
    plannedAt: toDateOnly(row.planned_at),
    completedAt: toDateOnly(row.completed_at),
    budgetLevel: row.budget_level ?? undefined,
    coverPhotoId: row.cover_photo_id ?? undefined,
    photos: (row.experience_photos ?? []).map((p) => ({
      id: p.id,
      storagePath: p.storage_path,
      uploadedBy: p.uploaded_by_profile_id,
    })),
    ratings: (row.ratings ?? [])
      .filter((r) => r.profiles?.fixed_profile_key)
      .map((r) => ({
        profileKey: r.profiles!.fixed_profile_key,
        score: Number(r.score),
        submittedAt: r.created_at,
      })),
    createdAt: row.created_at,
  };
}

function mapPlaceRow(row: {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  location_type: Place['locationType'];
}): Place {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    city: row.city ?? undefined,
    country: row.country ?? undefined,
    locationType: row.location_type,
  };
}

function mapCategoryRow(row: { id: string; name: string; icon: string; color: string }): Category {
  return { id: row.id, name: row.name, icon: row.icon, color: row.color };
}

function mapCoupleRow(row: {
  name: string | null;
  photo_url: string | null;
  relationship_started_on: string | null;
  base_city: string | null;
}): Couple {
  return {
    name: row.name ?? '',
    photoUrl: row.photo_url ?? undefined,
    relationshipStartedOn: toDateOnly(row.relationship_started_on),
    baseCity: row.base_city ?? undefined,
  };
}

function useInvalidateAppData() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [], exact: false });
}

// There's no push server yet (plan §5.12/Fase 11), so this only ever notifies THIS device's own
// activated profile when something relevant happens on it — it can't reach the partner's real
// device, unlike the old single-device mock which faked notifying "both sides" from one phone.
async function notifyIfEnabled(key: keyof NotificationSettings, title: string, body: string) {
  const activatedProfileId = useAuthStore.getState().activatedProfileId;
  if (!activatedProfileId) return;
  const { data } = await supabase
    .from('profiles')
    .select('notification_settings')
    .eq('id', activatedProfileId)
    .single();
  const settings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...(data?.notification_settings ?? {}) };
  if (settings[key]) await sendLocalNotification(title, body);
}

async function notifyIfJustRevealed(experienceId: string) {
  const { data } = await supabase
    .from('experiences')
    .select('title, ratings(id)')
    .eq('id', experienceId)
    .single();
  if (data && (data.ratings ?? []).length === 2) {
    await notifyIfEnabled('ratingRevealed', '¡Puntuaciones reveladas! ✨', `Ya pueden ver cómo calificaron "${data.title}".`);
  }
}

export function useExperiences(status?: ExperienceStatus) {
  const coupleId = useAuthStore((state) => state.coupleId);
  return useQuery<Experience[]>({
    queryKey: ['experiences', coupleId, status ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('experiences')
        .select(EXPERIENCE_SELECT)
        .eq('couple_id', coupleId as string)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as ExperienceRow[]).map(mapExperienceRow);
    },
    enabled: !!coupleId,
  });
}

export function useExperience(id: string) {
  return useQuery<Experience | undefined>({
    queryKey: ['experiences', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select(EXPERIENCE_SELECT)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapExperienceRow(data as unknown as ExperienceRow) : undefined;
    },
    enabled: !!id,
  });
}

export function usePlaces() {
  const coupleId = useAuthStore((state) => state.coupleId);
  return useQuery<Place[]>({
    queryKey: ['places', coupleId],
    queryFn: async () => {
      const { data, error } = await supabase.from('places').select('*').eq('couple_id', coupleId as string);
      if (error) throw error;
      return data.map(mapPlaceRow);
    },
    enabled: !!coupleId,
  });
}

export function usePlace(id: string | undefined) {
  return useQuery<Place | undefined>({
    queryKey: ['places', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('places').select('*').eq('id', id as string).maybeSingle();
      if (error) throw error;
      return data ? mapPlaceRow(data) : undefined;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  const coupleId = useAuthStore((state) => state.coupleId);
  return useQuery<Category[]>({
    queryKey: ['categories', coupleId],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('couple_id', coupleId as string);
      if (error) throw error;
      return data.map(mapCategoryRow);
    },
    enabled: !!coupleId,
  });
}

export function useCouple() {
  const coupleId = useAuthStore((state) => state.coupleId);
  return useQuery<Couple>({
    queryKey: ['couples', coupleId],
    queryFn: async () => {
      const { data, error } = await supabase.from('couples').select('*').eq('id', coupleId as string).single();
      if (error) throw error;
      return mapCoupleRow(data);
    },
    enabled: !!coupleId,
  });
}

export function useNotificationSettings() {
  const activatedProfileId = useAuthStore((state) => state.activatedProfileId);
  return useQuery<NotificationSettings>({
    queryKey: ['notification-settings', activatedProfileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', activatedProfileId as string)
        .single();
      if (error) throw error;
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...(data.notification_settings ?? {}) };
    },
    enabled: !!activatedProfileId,
  });
}

export function useUpdateNotificationSetting() {
  const activatedProfileId = useAuthStore((state) => state.activatedProfileId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: keyof NotificationSettings; value: boolean }) => {
      const { data: current, error: readError } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', activatedProfileId as string)
        .single();
      if (readError) throw readError;
      const merged = { ...DEFAULT_NOTIFICATION_SETTINGS, ...(current.notification_settings ?? {}), [key]: value };
      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: merged })
        .eq('id', activatedProfileId as string);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-settings', activatedProfileId] }),
  });
}

export function useSignedPhotoUrl(storagePath: string | undefined) {
  return useQuery<string | undefined>({
    queryKey: ['signed-photo-url', storagePath],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('experience-photos')
        .createSignedUrl(storagePath as string, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!storagePath,
    staleTime: 50 * 60 * 1000, // a bit under the 1-hour signed URL expiry
  });
}

export function useCreatePlace() {
  const coupleId = useAuthStore((state) => state.coupleId);
  const activatedProfileId = useAuthStore((state) => state.activatedProfileId);
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async (input: Omit<Place, 'id'>) => {
      const { data, error } = await supabase
        .from('places')
        .insert({
          couple_id: coupleId,
          name: input.name,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          city: input.city,
          country: input.country,
          location_type: input.locationType,
          created_by_profile_id: activatedProfileId,
        })
        .select()
        .single();
      if (error) throw error;
      return mapPlaceRow(data);
    },
    onSuccess: invalidate,
  });
}

interface CreateIdeaInput {
  title: string;
  description?: string;
  categoryId?: string;
  placeId?: string;
  budgetLevel?: BudgetLevel;
}

export function useCreateIdea() {
  const coupleId = useAuthStore((state) => state.coupleId);
  const activatedProfileId = useAuthStore((state) => state.activatedProfileId);
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async (input: CreateIdeaInput) => {
      const { error } = await supabase.from('experiences').insert({
        couple_id: coupleId,
        title: input.title,
        description: input.description,
        category_id: input.categoryId,
        place_id: input.placeId,
        budget_level: input.budgetLevel,
        created_by_profile_id: activatedProfileId,
        status: 'idea',
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateExperience() {
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<Experience, 'status' | 'placeId' | 'plannedAt' | 'completedAt'>>;
    }) => {
      const payload: Record<string, unknown> = {};
      if (patch.status !== undefined) payload.status = patch.status;
      if (patch.placeId !== undefined) payload.place_id = patch.placeId;
      if (patch.plannedAt !== undefined) payload.planned_at = patch.plannedAt;
      if (patch.completedAt !== undefined) payload.completed_at = patch.completedAt;
      const { error } = await supabase.from('experiences').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDiscardIdea() {
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('experiences').update({ status: 'discarded' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useConvertIdeaToPlan() {
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async ({ id, placeId, plannedAt }: { id: string; placeId: string; plannedAt: string }) => {
      const { error } = await supabase
        .from('experiences')
        .update({ status: 'planned', place_id: placeId, planned_at: plannedAt })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useRevertPlanToIdea() {
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('experiences')
        .update({ status: 'idea', planned_at: null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useMarkCompleted() {
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async ({ id, completedAt, placeId }: { id: string; completedAt: string; placeId?: string }) => {
      const payload: Record<string, unknown> = { status: 'completed', completed_at: completedAt };
      if (placeId) payload.place_id = placeId;
      const { error } = await supabase.from('experiences').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: async (_data, variables) => {
      invalidate();
      const { data } = await supabase.from('experiences').select('title').eq('id', variables.id).single();
      await notifyIfEnabled(
        'ratingRequested',
        'Ya pueden calificarla 💌',
        data ? `"${data.title}" quedó marcada como realizada.` : 'Una cita quedó marcada como realizada.',
      );
    },
  });
}

export function useAddPhoto(experienceId: string) {
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async (photo: { storagePath: string; uploadedBy: string }) => {
      const { data, error } = await supabase
        .from('experience_photos')
        .insert({
          experience_id: experienceId,
          storage_path: photo.storagePath,
          uploaded_by_profile_id: photo.uploadedBy,
        })
        .select()
        .single();
      if (error) throw error;

      const { data: experience } = await supabase
        .from('experiences')
        .select('cover_photo_id')
        .eq('id', experienceId)
        .single();
      if (experience && !experience.cover_photo_id) {
        await supabase.from('experiences').update({ cover_photo_id: data.id }).eq('id', experienceId);
      }
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useRemovePhoto() {
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async (photoId: string) => {
      const { data: photo } = await supabase
        .from('experience_photos')
        .select('storage_path')
        .eq('id', photoId)
        .single();
      const { error } = await supabase.from('experience_photos').delete().eq('id', photoId);
      if (error) throw error;
      if (photo) await supabase.storage.from('experience-photos').remove([photo.storage_path]);
    },
    onSuccess: invalidate,
  });
}

export function useSetCoverPhoto(experienceId: string) {
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase.from('experiences').update({ cover_photo_id: photoId }).eq('id', experienceId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSubmitRating(experienceId: string) {
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async ({ score }: { score: number }) => {
      const { error } = await supabase.rpc('submit_rating', { p_experience_id: experienceId, p_score: score });
      if (error) throw error;
    },
    onSuccess: async () => {
      invalidate();
      await notifyIfJustRevealed(experienceId);
    },
  });
}

export function useUpdateCouple() {
  const coupleId = useAuthStore((state) => state.coupleId);
  const invalidate = useInvalidateAppData();
  return useMutation({
    mutationFn: async (patch: Partial<Couple>) => {
      const payload: Record<string, unknown> = {};
      if (patch.name !== undefined) payload.name = patch.name;
      if (patch.photoUrl !== undefined) payload.photo_url = patch.photoUrl;
      if (patch.relationshipStartedOn !== undefined) payload.relationship_started_on = patch.relationshipStartedOn;
      if (patch.baseCity !== undefined) payload.base_city = patch.baseCity;
      const { error } = await supabase.from('couples').update(payload).eq('id', coupleId as string);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
