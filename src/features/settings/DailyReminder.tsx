import React, { useEffect, useState } from "react";
import { Box, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { DEFAULT_REMINDER, loadReminder, ReminderSetting, saveReminder } from "../../native/reminders";
import { isNativeApp } from "../../native/platform";
import { useNotification } from "../../hooks/useNotification";

const pad = (n: number) => String(n).padStart(2, "0");

/** Daily practice reminder (local notification). Only shown in the iOS/Android apps. */
export function DailyReminder() {
  const [setting, setSetting] = useState<ReminderSetting>(DEFAULT_REMINDER);
  const { notify } = useNotification();

  useEffect(() => {
    if (isNativeApp()) loadReminder().then(setSetting);
  }, []);

  if (!isNativeApp()) return null;

  const apply = async (next: ReminderSetting) => {
    setSetting(next);
    const ok = await saveReminder(next).catch(() => false);
    if (!ok && next.enabled) {
      setSetting({ ...next, enabled: false });
      notify("Allow notifications for Polar Chess in your device settings to get reminders.", "warning");
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <FormControlLabel
        control={
          <Switch
            id="daily-reminder"
            checked={setting.enabled}
            onChange={(e) => apply({ ...setting, enabled: e.target.checked })}
          />
        }
        label="Daily practice reminder"
      />
      {setting.enabled && (
        <TextField
          id="daily-reminder-time"
          label="Remind me at"
          type="time"
          value={`${pad(setting.hour)}:${pad(setting.minute)}`}
          onChange={(e) => {
            const [h, m] = e.target.value.split(":").map(Number);
            if (!Number.isNaN(h) && !Number.isNaN(m)) apply({ ...setting, hour: h, minute: m });
          }}
          fullWidth
          margin="normal"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      )}
      <Typography variant="body2" color="text.secondary">
        A notification at the same time every day. Nothing is sent to our server.
      </Typography>
    </Box>
  );
}
