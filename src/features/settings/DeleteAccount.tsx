import React, { useCallback, useState } from "react";
import { useBackHandler } from "../../native/useBackHandler";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { DefaultService } from "../../api";
import { useAuthStore } from "../../stores/authStore";
import { useNotification } from "../../hooks/useNotification";
import { getErrorStatus } from "../../utils/errors";

/** "Delete account" section of Settings. Asks for the password again, then logs out. */
export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const logout = useAuthStore((s) => s.logout);
  const { notify } = useNotification();

  const mutation = useMutation({
    mutationFn: () => DefaultService.deleteMyAccountApiAccountDeletePost({ password }),
    onSuccess: () => {
      setOpen(false);
      notify("Your account and all your data have been deleted.", "success");
      logout();
    },
    onError: (err: unknown) => {
      const status = getErrorStatus(err);
      setError(
        status === 401
          ? "That password is not correct."
          : status === 429
            ? "Too many attempts. Wait a minute and try again."
            : "Could not delete the account. Check your connection and try again.",
      );
    },
  });

  const close = useCallback(() => {
    if (mutation.isPending) return;
    setOpen(false);
    setPassword("");
    setError(null);
  }, [mutation.isPending]);
  useBackHandler(open, close);

  return (
    <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: "divider" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Delete account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Permanently deletes your login, courses and practice history. This cannot be undone.
      </Typography>
      <Button variant="outlined" color="error" onClick={() => setOpen(true)} fullWidth>
        Delete my account
      </Button>

      <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Your login, courses, positions and practice history will be deleted permanently. Enter your
            password to confirm.
          </DialogContentText>
          <TextField
            id="delete-account-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            fullWidth
            autoFocus
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={!password || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
