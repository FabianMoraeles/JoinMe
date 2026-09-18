import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform, Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
import { colors } from '@/theme/colors';

interface DateFieldProps {
  label: string;
  value: string; // AAAA-MM-DD
  onChange: (value: string) => void;
  error?: string;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(value: string) {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

// SDK 57's DateTimePicker is imperative on Android (fires once, closes itself) but stays
// mounted inline on iOS, so the two platforms need different open/close handling.
export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(() => parseIsoDate(value));

  function openPicker() {
    setDraft(parseIsoDate(value));
    setVisible(true);
  }

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setVisible(false);
      if (event.type === 'set' && selected) onChange(toIsoDate(selected));
      return;
    }
    if (selected) setDraft(selected);
  }

  return (
    <View className="gap-1">
      <Text className="font-jakarta-semibold text-label-lg text-on-surface">{label}</Text>
      <Pressable
        onPress={openPicker}
        className="flex-row items-center justify-between rounded-lg bg-surface-container-lowest px-space-md py-3 shadow-sm"
      >
        <Text className="font-jakarta text-body-md text-on-surface">{value || 'Seleccionar fecha'}</Text>
        <MaterialIcons name="calendar-today" size={18} color={colors.onSurfaceVariant} />
      </Pressable>
      {error ? <Text className="font-jakarta text-body-sm text-error">{error}</Text> : null}

      {visible && Platform.OS === 'android' ? (
        <DateTimePicker value={draft} mode="date" display="default" onChange={handleChange} />
      ) : null}

      {visible && Platform.OS === 'ios' ? (
        <View className="gap-space-sm rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
          <DateTimePicker value={draft} mode="date" display="spinner" onChange={handleChange} />
          <PrimaryButton
            label="Listo"
            icon="check"
            onPress={() => {
              onChange(toIsoDate(draft));
              setVisible(false);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
