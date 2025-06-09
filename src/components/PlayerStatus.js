import React from 'react';
import { Box, Typography, LinearProgress, Chip, Stack, Avatar } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export function PlayerStatus({ playerStatus }) {
  if (!playerStatus) return null;

  const { name, rating, progress, level, achievements } = playerStatus;

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">{name || 'Unknown Player'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Rating: {rating || 'N/A'}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Level {level || 1} Progress
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress || 0} 
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      {achievements && achievements.length > 0 && (
        <Box>
          <Typography variant="body2" gutterBottom>
            Achievements
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {achievements.map((achievement, index) => (
              <Chip
                key={index}
                icon={<EmojiEventsIcon />}
                label={achievement}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
