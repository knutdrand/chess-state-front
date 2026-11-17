import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";

const REMINDER_ID = 1;
const PREF_KEY = "dailyReminder"; // JSON {enabled, hour, minute}

export interface ReminderSetting {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const DEFAULT_REMINDER: ReminderSetting = { enabled: false, hour: 19, minute: 0 };

export async function loadReminder(): Promise<ReminderSetting> {
  try {
    const { value } = await Preferences.get({ key: PREF_KEY });
    return value ? { ...DEFAULT_REMINDER, ...JSON.parse(value) } : DEFAULT_REMINDER;
  } catch {
    return DEFAULT_REMINDER;
  }
}

/** Schedule (or cancel) the daily local notification. Returns false if permission was refused. */
export async function saveReminder(setting: ReminderSetting): Promise<boolean> {
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] }).catch(() => undefined);
  if (setting.enabled) {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return false;
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: "Time for a few positions",
          body: "A short practice keeps your openings sharp.",
          schedule: { on: { hour: setting.hour, minute: setting.minute }, allowWhileIdle: true },
        },
      ],
    });
  }
  await Preferences.set({ key: PREF_KEY, value: JSON.stringify(setting) });
  return true;
}
