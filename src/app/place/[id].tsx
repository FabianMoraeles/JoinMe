import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ExperienceCard } from '@/components/ui/experience-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useCategories, useExperiences, usePlace } from '@/features/experiences/use-experiences';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: place } = usePlace(id);
  const { data: experiences } = useExperiences();
  const { data: categories } = useCategories();

  if (!place) return null;

  const placeExperiences = (experiences ?? []).filter((e) => e.placeId === place.id && e.status !== 'discarded');

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title={place.name} />
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-md">
        <View className="gap-1 rounded-lg bg-surface-container-lowest p-space-lg shadow-sm">
          <Text className="font-jakarta-bold text-headline-md text-on-surface">{place.name}</Text>
          {place.city ? (
            <Text className="font-jakarta text-body-md text-on-surface-variant">{place.city}</Text>
          ) : null}
        </View>

        <View className="gap-space-sm">
          <Text className="font-jakarta-bold text-label-sm uppercase tracking-wider text-on-surface-variant">
            Citas en este lugar ({placeExperiences.length})
          </Text>
          {placeExperiences.length === 0 ? (
            <Text className="font-jakarta text-body-md text-on-surface-variant">
              Todavía no hay citas registradas en este lugar.
            </Text>
          ) : (
            placeExperiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                category={categories?.find((c) => c.id === experience.categoryId)}
                place={place}
                onPress={() => router.push(`/experience/${experience.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
