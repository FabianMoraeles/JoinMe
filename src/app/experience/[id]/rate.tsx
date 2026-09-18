import { useState } from 'react';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { HeartRatingInput } from '@/components/ui/heart-rating-input';
import { Pill } from '@/components/ui/pill';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useExperience, usePlace, useSignedPhotoUrl, useSubmitRating } from '@/features/experiences/use-experiences';
import { PROFILES, partnerOf, useAuthStore } from '@/stores/use-auth-store';

const SCALE_ROWS = [
  { hearts: 1, label: 'No fue para nosotros' },
  { hearts: 2, label: 'Estuvo regular' },
  { hearts: 3, label: 'La pasamos bien' },
  { hearts: 4, label: 'Nos encantó' },
  { hearts: 5, label: 'Nos encantó totalmente' },
];

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=60';

export default function RateExperienceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const activatedProfile = useAuthStore((state) => state.activatedProfile);
  const { data: experience } = useExperience(id);
  const { data: place } = usePlace(experience?.placeId);
  const { mutate: submitRating, isPending } = useSubmitRating(id);
  const [score, setScore] = useState(5);

  const coverPhoto = experience?.photos.find((p) => p.id === experience.coverPhotoId) ?? experience?.photos[0];
  const { data: coverPhotoUrl } = useSignedPhotoUrl(coverPhoto?.storagePath);

  if (!experience || !activatedProfile) return null;

  const partner = partnerOf(activatedProfile);

  function handleSubmit() {
    submitRating({ score }, { onSuccess: () => router.replace(`/experience/${id}/rate-waiting`) });
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Calificar Cita" avatarUri={PROFILES[activatedProfile].avatarUrl} />
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-md">
        <View className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-sm">
          <View className="relative h-36 w-full">
            <Image source={{ uri: coverPhotoUrl ?? FALLBACK_PHOTO }} style={{ flex: 1 }} contentFit="cover" />
            <View className="absolute bottom-3 left-4 right-4 gap-1">
              <Pill label="Voto Secreto" icon="lock" tone="primary" />
              <Text className="font-jakarta-bold text-headline-md text-white">{experience.title}</Text>
              <Text className="font-jakarta text-body-sm text-white/80">
                {place?.name ?? 'Sin lugar'} · {experience.completedAt}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between bg-surface-container-low px-4 py-3">
            <View className="flex-row items-center gap-2.5">
              <Avatar uri={PROFILES[activatedProfile].avatarUrl} size={28} />
              <View>
                <Text className="font-jakarta-semibold text-label-md text-secondary">
                  Puntuando como {PROFILES[activatedProfile].displayName}
                </Text>
                <Text className="font-jakarta text-label-sm text-on-surface-variant">Tu veredicto privado</Text>
              </View>
            </View>
            <Pill label={`Esperando a ${PROFILES[partner].displayName}`} icon="hourglass-top" tone="secondary" />
          </View>
        </View>

        <View className="items-center gap-space-xs rounded-lg bg-surface-container-lowest p-space-lg shadow-sm">
          <Text className="text-center font-jakarta-bold text-headline-lg-mobile text-on-surface">
            ¿Qué te pareció esta cita?
          </Text>
          <Text className="max-w-[280px] text-center font-jakarta text-body-md text-on-surface-variant">
            Tu voto permanecerá sellado hasta que {PROFILES[partner].displayName} también responda.
          </Text>

          <HeartRatingInput value={score} onChange={setScore} />

          <View className="mt-space-lg w-full gap-1.5 border-t border-surface-container pt-space-md">
            <Text className="px-1 font-jakarta-bold text-label-sm uppercase tracking-wider text-on-surface-variant">
              Escala emocional
            </Text>
            {SCALE_ROWS.map((row) => (
              <View
                key={row.hearts}
                className={`flex-row items-center justify-between rounded px-3 py-1.5 ${
                  row.hearts === score ? 'bg-primary-fixed' : 'bg-surface-container-low'
                }`}
              >
                <Text className="font-jakarta text-body-sm text-on-surface-variant">{row.hearts} corazones</Text>
                <Text className="font-jakarta-semibold text-label-sm text-on-surface-variant">{row.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <PrimaryButton label="Enviar mi puntuación" icon="send" onPress={handleSubmit} loading={isPending} />
      </ScrollView>
    </View>
  );
}
