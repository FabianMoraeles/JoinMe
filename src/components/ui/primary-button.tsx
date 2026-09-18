import type { ComponentProps, ReactNode } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  variant?: 'gradient' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = 'gradient',
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  const content: ReactNode = (
    <View className="flex-row items-center justify-center gap-1.5">
      {loading ? (
        <ActivityIndicator color={variant === 'gradient' ? colors.onPrimary : colors.secondary} />
      ) : (
        <>
          {icon ? (
            <MaterialIcons name={icon} size={18} color={variant === 'gradient' ? colors.onPrimary : colors.secondary} />
          ) : null}
          <Text
            className={`font-jakarta-semibold text-label-lg ${variant === 'gradient' ? 'text-on-primary' : 'text-secondary'}`}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable onPress={onPress} disabled={disabled || loading} className="active:opacity-80">
      {variant === 'gradient' ? (
        <LinearGradient
          colors={[colors.secondary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`rounded-full px-space-md py-3.5 ${disabled ? 'opacity-50' : ''}`}
        >
          {content}
        </LinearGradient>
      ) : (
        <View className={`rounded-full bg-surface-container-lowest px-space-md py-3.5 shadow-sm ${disabled ? 'opacity-50' : ''}`}>
          {content}
        </View>
      )}
    </Pressable>
  );
}
