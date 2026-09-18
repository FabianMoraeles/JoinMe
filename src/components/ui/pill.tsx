import type { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/theme/colors';

interface PillProps {
  label: string;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  tone?: 'secondary' | 'primary' | 'neutral';
  className?: string;
}

const toneStyles: Record<NonNullable<PillProps['tone']>, { bg: string; text: string; iconColor: string }> = {
  secondary: { bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed', iconColor: colors.onSecondaryFixed },
  primary: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed', iconColor: colors.onPrimaryFixed },
  neutral: { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant', iconColor: colors.onSurfaceVariant },
};

export function Pill({ label, icon, tone = 'neutral', className }: PillProps) {
  const { bg, text, iconColor } = toneStyles[tone];
  return (
    <View className={`flex-row items-center gap-1 self-start rounded-full px-3 py-1 ${bg} ${className ?? ''}`}>
      {icon ? <MaterialIcons name={icon} size={13} color={iconColor} /> : null}
      <Text className={`font-jakarta-semibold text-label-sm uppercase tracking-wider ${text}`}>{label}</Text>
    </View>
  );
}
