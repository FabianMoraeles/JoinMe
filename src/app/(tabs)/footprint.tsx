import type { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { useCategories, useExperiences, usePlaces } from '@/features/experiences/use-experiences';
import { colors } from '@/theme/colors';

export default function FootprintScreen() {
  const { data: experiences } = useExperiences('completed');
  const { data: places } = usePlaces();
  const { data: categories } = useCategories();

  if (!experiences || experiences.length === 0) {
    return (
      <PlaceholderScreen
        icon="insights"
        title="Huella"
        description="Todavía no tienen citas realizadas. En cuanto completen la primera, aquí verán sus estadísticas."
      />
    );
  }

  const distinctPlaceIds = new Set(experiences.map((e) => e.placeId).filter(Boolean));
  const cities = new Set(
    experiences
      .map((e) => places?.find((p) => p.id === e.placeId)?.city)
      .filter((city): city is string => !!city),
  );

  const categoryCounts = new Map<string, number>();
  experiences.forEach((e) => {
    if (e.categoryId) categoryCounts.set(e.categoryId, (categoryCounts.get(e.categoryId) ?? 0) + 1);
  });
  const topCategoryEntry = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry ? categories?.find((c) => c.id === topCategoryEntry[0]) : undefined;

  const placeCounts = new Map<string, number>();
  experiences.forEach((e) => {
    if (e.placeId) placeCounts.set(e.placeId, (placeCounts.get(e.placeId) ?? 0) + 1);
  });
  const topPlaceEntry = [...placeCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topPlace = topPlaceEntry ? places?.find((p) => p.id === topPlaceEntry[0]) : undefined;

  const revealedAverages = experiences
    .filter((e) => e.ratings.length === 2)
    .map((e) => (e.ratings[0].score + e.ratings[1].score) / 2);
  const jointAverage = revealedAverages.length
    ? revealedAverages.reduce((sum, n) => sum + n, 0) / revealedAverages.length
    : null;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-lg">
        <Text className="font-jakarta-bold text-headline-md text-on-surface">Huella</Text>

        <View className="flex-row flex-wrap gap-space-sm">
          <StatTile icon="favorite" label="Citas realizadas" value={String(experiences.length)} />
          <StatTile icon="location-on" label="Lugares distintos" value={String(distinctPlaceIds.size)} />
          <StatTile icon="public" label="Ciudades" value={String(cities.size)} />
          <StatTile icon="star" label="Promedio conjunto" value={jointAverage ? jointAverage.toFixed(1) : '—'} />
        </View>

        {topCategory ? (
          <View className="flex-row items-center gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-sm">
            <MaterialIcons name={topCategory.icon as ComponentProps<typeof MaterialIcons>['name']} size={22} color={topCategory.color} />
            <Text className="flex-1 font-jakarta text-body-md text-on-surface">
              Su categoría favorita es <Text className="font-jakarta-semibold">{topCategory.name}</Text> (
              {topCategoryEntry?.[1]} citas)
            </Text>
          </View>
        ) : null}

        {topPlace ? (
          <View className="flex-row items-center gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-sm">
            <MaterialIcons name="military-tech" size={22} color={colors.secondary} />
            <Text className="flex-1 font-jakarta text-body-md text-on-surface">
              El lugar más visitado es <Text className="font-jakarta-semibold">{topPlace.name}</Text> (
              {topPlaceEntry?.[1]} veces)
            </Text>
          </View>
        ) : null}

        <View className="gap-space-sm">
          <Text className="font-jakarta-bold text-label-sm uppercase tracking-wider text-on-surface-variant">
            Citas por categoría
          </Text>
          <View className="gap-1 rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
            {[...categoryCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([categoryId, count]) => {
                const category = categories?.find((c) => c.id === categoryId);
                if (!category) return null;
                const widthPercent = Math.round((count / experiences.length) * 100);
                return (
                  <View key={categoryId} className="gap-1 px-space-sm py-1.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-jakarta-semibold text-label-md text-on-surface">{category.name}</Text>
                      <Text className="font-jakarta text-label-sm text-on-surface-variant">{count}</Text>
                    </View>
                    <View className="h-1.5 overflow-hidden rounded-full bg-surface-container">
                      <View className="h-full rounded-full" style={{ width: `${widthPercent}%`, backgroundColor: category.color }} />
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View className="min-w-[46%] flex-1 gap-1 rounded-lg bg-surface-container-lowest p-space-md shadow-sm">
      <MaterialIcons name={icon} size={20} color={colors.primary} />
      <Text className="font-jakarta-extrabold text-headline-md text-on-surface">{value}</Text>
      <Text className="font-jakarta text-body-sm text-on-surface-variant">{label}</Text>
    </View>
  );
}
