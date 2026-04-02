
import React, { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';
import { useAuthStore } from '../stores/authStore';

const Config = () => {
  const token = useAuthStore((s) => s.token);
  const [rating, setRating] = useState('');
  const [allowedMistakes, setAllowedMistakes] = useState(3);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [, setMessageType] = useState('info');

  const headers = {
    'accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const handleSubmit = async () => {
    if (rating === '') {
      setMessage('Rating cannot be empty');
      setMessageType('error');
      return;
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 3000) {
      setMessage('Please enter a valid rating between 0 and 3000');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      await axios.patch(
        `${apiUrl}/player-config`,
        { rating: ratingNum, allowed_mistakes: allowedMistakes },
        { headers }
      );

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
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Settings</h2>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="rating" style={{ display: 'block', marginBottom: '5px' }}>Chess Rating</label>
        <input
          id="rating"
          type="number"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value) || '')}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="allowedMistakes" style={{ display: 'block', marginBottom: '5px' }}>Allowed Mistakes (1-10)</label>
        <input
          id="allowedMistakes"
          type="number"
          min={1}
          max={10}
          value={allowedMistakes}
          onChange={(e) => setAllowedMistakes(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Updating...' : 'Save Settings'}
      </button>
      {message && <p style={{ marginTop: '10px', color: message.startsWith('Success') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

export default Config;
