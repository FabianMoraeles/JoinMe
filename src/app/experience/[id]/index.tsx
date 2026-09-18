import type { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Pill } from '@/components/ui/pill';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import {
  useAddPhoto,
  useCategories,
  useDiscardIdea,
  useExperience,
  usePlace,
  useRemovePhoto,
  useRevertPlanToIdea,
  useSetCoverPhoto,
  useUpdateExperience,
} from '@/features/experiences/use-experiences';
import { getRatingStatus } from '@/features/experiences/types';
import { colors } from '@/theme/colors';
import { useAuthStore } from '@/stores/use-auth-store';

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const { data: experience } = useExperience(id);
  const { data: place } = usePlace(experience?.placeId);
  const { data: categories } = useCategories();
  const { mutate: discardIdea } = useDiscardIdea();
  const { mutate: revertPlanToIdea } = useRevertPlanToIdea();
  const { mutate: updateExperience } = useUpdateExperience();
  const { mutate: addPhoto } = useAddPhoto(id);
  const { mutate: removePhoto } = useRemovePhoto(id);
  const { mutate: setCoverPhoto } = useSetCoverPhoto(id);

  if (!experience) return null;

  const category = categories?.find((c) => c.id === experience.categoryId);

  async function handleAddPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      allowsMultipleSelection: true,
    });
    if (result.canceled) return;
    result.assets.forEach((asset) => addPhoto({ uri: asset.uri, uploadedBy: activeProfile }));
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title={experience.title} />
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-md">
        <View className="gap-space-sm">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-space-sm">
            {experience.photos.map((photo) => (
              <View key={photo.id} className="relative h-32 w-32 overflow-hidden rounded-lg">
                <Image source={{ uri: photo.uri }} style={{ width: 128, height: 128 }} contentFit="cover" />
                {photo.id === experience.coverPhotoId ? (
                  <View className="absolute left-1 top-1 rounded-full bg-primary-fixed px-1.5 py-0.5">
                    <Text className="font-jakarta-semibold text-label-sm text-on-primary-fixed">Portada</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setCoverPhoto(photo.id)}
                    className="absolute left-1 top-1 rounded-full bg-surface-container-lowest/90 px-1.5 py-0.5"
                  >
                    <Text className="font-jakarta-semibold text-label-sm text-on-surface-variant">Usar de portada</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => removePhoto(photo.id)}
                  className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-surface-container-lowest/90"
                >
                  <MaterialIcons name="close" size={14} color={colors.error} />
                </Pressable>
              </View>
            ))}
            <Pressable
              onPress={handleAddPhoto}
              className="h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-lowest"
            >
              <MaterialIcons name="add-a-photo" size={24} color={colors.outline} />
              <Text className="mt-1 font-jakarta-semibold text-label-sm text-on-surface-variant">Añadir foto</Text>
            </Pressable>
          </ScrollView>
        </View>

        <View className="gap-space-sm rounded-lg bg-surface-container-lowest p-space-lg shadow-sm">
          <View className="flex-row flex-wrap items-center gap-2">
            {category ? (
              <Pill label={category.name} icon={category.icon as ComponentProps<typeof MaterialIcons>['name']} tone="neutral" />
            ) : null}
            {place ? (
              <Pressable onPress={() => router.push(`/place/${place.id}`)}>
                <Pill label={place.name} icon="location-on" tone="neutral" />
              </Pressable>
            ) : null}
            {experience.plannedAt ? <Pill label={`Planeada: ${experience.plannedAt}`} icon="event" tone="secondary" /> : null}
            {experience.completedAt ? (
              <Pill label={`Realizada: ${experience.completedAt}`} icon="check-circle" tone="primary" />
            ) : null}
          </View>
          {experience.description ? (
            <Text className="font-jakarta text-body-md text-on-surface-variant">{experience.description}</Text>
          ) : null}
        </View>

        {experience.status === 'idea' ? (
          <View className="gap-space-sm">
            <PrimaryButton
              label="Convertir en plan"
              icon="event-available"
              onPress={() => router.push(`/experience/${id}/plan`)}
            />
            <PrimaryButton
              label="Descartar idea"
              icon="delete-outline"
              variant="ghost"
              onPress={() => discardIdea(id, { onSuccess: () => router.back() })}
            />
          </View>
        ) : null}

        {experience.status === 'planned' ? (
          <View className="gap-space-sm">
            <PrimaryButton
              label="Marcar como realizada"
              icon="check-circle"
              onPress={() => router.push(`/experience/${id}/complete`)}
            />
            <PrimaryButton label="Volver a idea" icon="undo" variant="ghost" onPress={() => revertPlanToIdea(id)} />
          </View>
        ) : null}

        {experience.status === 'completed' ? <RatingCta experienceId={id} /> : null}

        {experience.status === 'discarded' ? (
          <PrimaryButton
            label="Restaurar como idea"
            icon="restore"
            variant="ghost"
            onPress={() => updateExperience({ id, patch: { status: 'idea' } })}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function RatingCta({ experienceId }: { experienceId: string }) {
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const { data: experience } = useExperience(experienceId);
  if (!experience) return null;

  const status = getRatingStatus(experience, activeProfile);
  if (status === 'awaiting-self') {
    return <PrimaryButton label="Puntuar esta cita" icon="favorite" onPress={() => router.push(`/experience/${experienceId}/rate`)} />;
  }
  if (status === 'awaiting-partner') {
    return (
      <PrimaryButton
        label="Ver estado de la puntuación"
        icon="hourglass-top"
        variant="ghost"
        onPress={() => router.push(`/experience/${experienceId}/rate-waiting`)}
      />
    );
  }
  return (
    <PrimaryButton
      label="Ver revelación de puntuaciones"
      icon="auto-awesome"
      onPress={() => router.push(`/experience/${experienceId}/rate-reveal`)}
    />
  );
}
