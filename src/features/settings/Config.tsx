
import React, { useState } from 'react';
import { Box, TextField, Button, Alert, Typography } from '@mui/material';
import { DefaultService } from '../../api';

const Config = () => {
  const [rating, setRating] = useState<number | ''>('');
  const [allowedMistakes, setAllowedMistakes] = useState(3);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');

  const handleSubmit = async () => {
    if (rating === '') {
      setMessage('Rating cannot be empty');
      setMessageType('error');
      return;
    }

    const ratingNum = typeof rating === 'number' ? rating : parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 3000) {
      setMessage('Please enter a valid rating between 0 and 3000');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      await DefaultService.ratingApiPlayerConfigPatch({
        rating: ratingNum,
        allowed_mistakes: allowedMistakes,
      });

      setMessage('Settings updated successfully');
      setMessageType('success');
    } catch (error) {
      console.error('Error updating rating:', error);

      setMessage('Failed to update settings');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 2.5 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Settings</Typography>
      <TextField
        id="rating"
        label="Chess Rating"
        type="number"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value) || '')}
        fullWidth
        margin="normal"
      />
      <TextField
        id="allowedMistakes"
        label="Allowed Mistakes (1-10)"
        type="number"
        inputProps={{ min: 1, max: 10 }}
        value={allowedMistakes}
        onChange={(e) => setAllowedMistakes(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading}
        fullWidth
        sx={{ mt: 1 }}
      >
        {loading ? 'Updating...' : 'Save Settings'}
      </Button>
      {message && (
        <Alert severity={messageType === 'success' ? 'success' : 'error'} sx={{ mt: 1.5 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default Config;
