import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExperienceCard } from '@/components/ui/experience-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useCategories, useExperiences, usePlaces } from '@/features/experiences/use-experiences';

export default function IdeasScreen() {
  const { data: ideas } = useExperiences('idea');
  const { data: planned } = useExperiences('planned');
  const { data: categories } = useCategories();
  const { data: places } = usePlaces();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-lg">
        <View className="flex-row items-center justify-between">
          <Text className="font-jakarta-bold text-headline-md text-on-surface">Ideas</Text>
        </View>

        <PrimaryButton label="Nueva idea" icon="add" onPress={() => router.push('/idea/create')} />

        {planned && planned.length > 0 ? (
          <View className="gap-space-sm">
            <Text className="font-jakarta-bold text-label-sm uppercase tracking-wider text-on-surface-variant">
              Próximas citas planeadas
            </Text>
            {planned.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                category={categories?.find((c) => c.id === experience.categoryId)}
                place={places?.find((p) => p.id === experience.placeId)}
                onPress={() => router.push(`/experience/${experience.id}`)}
              />
            ))}
          </View>
        ) : null}

        <View className="gap-space-sm">
          <Text className="font-jakarta-bold text-label-sm uppercase tracking-wider text-on-surface-variant">
            Ideas guardadas
          </Text>
          {!ideas || ideas.length === 0 ? (
            <Text className="font-jakarta text-body-md text-on-surface-variant">
              Aún no tienen ideas guardadas. Toca "Nueva idea" para empezar.
            </Text>
          ) : (
            ideas.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                category={categories?.find((c) => c.id === experience.categoryId)}
                place={places?.find((p) => p.id === experience.placeId)}
                onPress={() => router.push(`/experience/${experience.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
