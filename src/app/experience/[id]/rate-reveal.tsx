import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Pill } from '@/components/ui/pill';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useExperience, usePlace, useSignedPhotoUrl } from '@/features/experiences/use-experiences';
import { colors } from '@/theme/colors';
import { PROFILES, type ProfileKey } from '@/stores/use-auth-store';

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=60';

export default function RateRevealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: experience } = useExperience(id);
  const { data: place } = usePlace(experience?.placeId);
  const coverPhoto = experience?.photos.find((p) => p.id === experience.coverPhotoId) ?? experience?.photos[0];
  const { data: coverPhotoUrl } = useSignedPhotoUrl(coverPhoto?.storagePath);

  if (!experience || experience.ratings.length < 2) return null;

  const [ratingA, ratingB] = experience.ratings;
  const average = (ratingA.score + ratingB.score) / 2;
  const harmony = Math.max(0, Math.round(100 - (Math.abs(ratingA.score - ratingB.score) / 5) * 100));

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Recuerdos Rituales" onBack={() => router.replace('/')} />
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-md">
        <View className="items-center gap-space-xs">
          <Pill label="¡Recuerdo Desbloqueado! ✨" icon="auto-awesome" tone="secondary" />
          <Text className="mt-1 text-center font-jakarta-bold text-headline-lg-mobile text-on-surface">
            Así vivimos esta cita en <Text className="text-secondary">{place?.name ?? 'este lugar'}</Text>
          </Text>
          <Text className="max-w-[320px] text-center font-jakarta text-body-md text-on-surface-variant">
            Una noche para recordar, sintonía compartida y complicidad absoluta.
          </Text>
        </View>

        <View className="relative overflow-hidden rounded-lg bg-surface-container-low shadow-md">
          <Image source={{ uri: coverPhotoUrl ?? FALLBACK_PHOTO }} style={{ width: '100%', height: 224 }} contentFit="cover" />
          <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-3 py-1.5">
              <MaterialIcons name="calendar-today" size={16} color={colors.primary} />
              <Text className="font-jakarta-semibold text-label-md text-on-surface">{experience.completedAt}</Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-surface-container-lowest/90 px-3 py-1.5">
              <MaterialIcons name="location-on" size={16} color={colors.secondary} />
              <Text className="font-jakarta-semibold text-label-md text-on-surface">{place?.name ?? 'Sin lugar'}</Text>
            </View>
          </View>
        </View>

        <View className="items-center gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-md">
          <View className="items-center">
            <Text className="font-jakarta-semibold text-label-sm uppercase tracking-widest text-on-surface-variant">
              Puntuación Promedio
            </Text>
            <View className="mt-1 flex-row items-baseline gap-1">
              <Text className="font-jakarta-extrabold text-headline-xl-mobile text-primary">
                {average.toFixed(1)}
              </Text>
              <MaterialIcons name="star" size={28} color={colors.primary} />
            </View>
            <View className="mt-2 flex-row items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1">
              <MaterialIcons name="favorite" size={15} color={colors.primary} />
              <Text className="font-jakarta-semibold text-label-md text-on-primary-fixed">
                Sintonía casi perfecta ({harmony}%)
              </Text>
            </View>
          </View>

          <View className="w-full flex-row gap-space-sm">
            {experience.ratings.map((rating) => (
              <RatingColumn key={rating.profileKey} profileKey={rating.profileKey} score={rating.score} />
            ))}
          </View>
        </View>

        <View className="flex-row items-center gap-space-md rounded-lg bg-surface-container-high p-space-md shadow-sm">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed">
            <MaterialIcons name="military-tech" size={24} color={colors.secondary} />
          </View>
          <View className="flex-1">
            <Text className="font-jakarta-semibold text-label-sm uppercase tracking-wider text-secondary">
              Insignia Conquistada
            </Text>
            <Text className="font-jakarta text-label-md text-on-surface">
              Cita de Oro añadida a{' '}
              <Text className="font-jakarta-semibold text-primary">{place?.name ?? 'este lugar'}</Text>
            </Text>
          </View>
        </View>

        <View className="mt-space-xs gap-space-sm">
          <PrimaryButton
            label="Ver recuerdo completo con fotos"
            icon="photo-library"
            onPress={() => router.replace(`/experience/${id}`)}
          />
          <PrimaryButton label="Planear algo parecido pronto" icon="favorite" variant="ghost" onPress={() => router.replace('/ideas')} />
        </View>
      </ScrollView>
    </View>
  );
}

function RatingColumn({ profileKey, score }: { profileKey: ProfileKey; score: number }) {
  const profile = PROFILES[profileKey];
  return (
    <View className="flex-1 items-center gap-2 rounded bg-surface-container-low p-3">
      <Avatar uri={profile.avatarUrl} size={48} />
      <Text className="font-jakarta-semibold text-label-lg text-on-surface">{profile.displayName}</Text>
      <View className="flex-row items-center gap-1">
        <Text className="font-jakarta-semibold text-title-md text-secondary">{score.toFixed(1)}</Text>
        <MaterialIcons name="favorite" size={16} color={colors.secondary} />
      </View>
    </View>
  );
}
