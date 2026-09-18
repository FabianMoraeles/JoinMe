import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

const SCALE_LABELS: Record<number, string> = {
  1: 'No fue para nosotros',
  2: 'Estuvo regular',
  3: 'La pasamos bien',
  4: 'Nos encantó',
  5: '¡Insuperable, queremos repetirla!',
};

interface HeartRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function HeartRatingInput({ value, onChange }: HeartRatingInputProps) {
  return (
    <View className="items-center gap-space-sm">
      <View className="mt-6 flex-row items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((heart) => (
          <Pressable
            key={heart}
            onPress={() => onChange(heart)}
            accessibilityRole="button"
            accessibilityLabel={`${heart} corazones`}
            className="h-12 w-12 items-center justify-center rounded-full active:scale-90"
          >
            <MaterialIcons
              name={heart <= value ? 'favorite' : 'favorite-border'}
              size={36}
              color={heart <= value ? colors.primaryContainer : colors.primaryFixed}
            />
          </Pressable>
        ))}
      </View>
      <View className="rounded-full bg-primary-fixed/60 px-4 py-1.5">
        <Text className="font-jakarta-bold text-label-lg text-on-primary-fixed">
          {value.toFixed(1)} - {SCALE_LABELS[value]}
        </Text>
      </View>
    </View>
  );
}
