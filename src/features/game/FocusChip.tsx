import React from "react";
import { Chip } from "@mui/material";
import { useFocus } from "../../hooks/useFocus";

/** Shown on the Play screen while practising only one line; ✕ clears the focus. */
export function FocusChip() {
  const { focus, label, clearFocus, busy } = useFocus();
  if (!focus) return null;
  return (
    <Chip
      size="small"
      color="secondary"
      label={`Focus: ${label}`}
      onDelete={() => clearFocus()}
      disabled={busy}
      sx={{ alignSelf: "flex-start", mb: 1, maxWidth: "100%", flexShrink: 0 }}
    />
  );
}
