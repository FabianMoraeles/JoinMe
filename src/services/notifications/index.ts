import * as Notifications from 'expo-notifications';

// SDK 57: shouldShowBanner/shouldShowList replaced the older shouldShowAlert field.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

// There is no real push server here (plan_app_parejas.md §5.12/Fase 11 needs one), so this
// schedules a short-delay local notification on the same device as a stand-in for what a real
// push to the partner's phone would trigger.
export async function sendLocalNotification(title: string, body: string) {
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
  });
}
