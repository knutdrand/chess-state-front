import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/** Suspense fallback for lazily loaded views. */
export function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4 }}>
      <CircularProgress />
    </Box>
  );
}
