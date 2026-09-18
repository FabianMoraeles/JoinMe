import type { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { Category, Experience, Place } from '@/features/experiences/types';

const STATUS_LABEL: Record<Experience['status'], string> = {
  idea: 'Idea',
  planned: 'Planeada',
  completed: 'Realizada',
  discarded: 'Descartada',
};

const STATUS_ICON: Record<Experience['status'], ComponentProps<typeof MaterialIcons>['name']> = {
  idea: 'lightbulb',
  planned: 'event',
  completed: 'check-circle',
  discarded: 'delete-outline',
};

interface ExperienceCardProps {
  experience: Experience;
  category?: Category;
  place?: Place;
  onPress?: () => void;
}

export function ExperienceCard({ experience, category, place, onPress }: ExperienceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="gap-space-xs rounded-lg bg-surface-container-lowest p-space-md shadow-sm active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1">
          <MaterialIcons name={STATUS_ICON[experience.status]} size={14} color="#906f72" />
          <Text className="font-jakarta-semibold text-label-sm text-on-surface-variant">
            {STATUS_LABEL[experience.status]}
          </Text>
        </View>
        {category ? (
          <View className="flex-row items-center gap-1">
            <MaterialIcons name={category.icon as ComponentProps<typeof MaterialIcons>['name']} size={16} color={category.color} />
            <Text className="font-jakarta-semibold text-label-sm" style={{ color: category.color }}>
              {category.name}
            </Text>
          </View>
        ) : null}
      </View>
      <Text className="font-jakarta-bold text-title-md text-on-surface">{experience.title}</Text>
      {experience.description ? (
        <Text numberOfLines={2} className="font-jakarta text-body-sm text-on-surface-variant">
          {experience.description}
        </Text>
      ) : null}
      <View className="flex-row items-center gap-space-sm">
        {place ? (
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="location-on" size={14} color="#906f72" />
            <Text className="font-jakarta text-body-sm text-on-surface-variant">{place.name}</Text>
          </View>
        ) : null}
        {experience.plannedAt ? (
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="calendar-today" size={14} color="#906f72" />
            <Text className="font-jakarta text-body-sm text-on-surface-variant">{experience.plannedAt}</Text>
          </View>
        ) : null}
        {experience.completedAt ? (
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="calendar-today" size={14} color="#906f72" />
            <Text className="font-jakarta text-body-sm text-on-surface-variant">{experience.completedAt}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
