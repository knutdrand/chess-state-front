
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import axios from 'axios';
import { apiUrl } from '../config';

const Config = ({ token }) => {
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  
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
      const response = await axios.patch(
        `${apiUrl}/player-config`, 
        { rating: ratingNum },
        { headers }
      );
      
      setMessage('Rating updated successfully');
      setMessageType('success');
    } catch (error) {
      console.error('Error updating rating:', error);

      setMessage('Failed to update rating');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Set Chess Rating</h2>
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
        {loading ? 'Updating...' : 'Update Rating'}
      </button>
      {message && <p style={{ marginTop: '10px', color: message.startsWith('Success') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

export default Config;
/* 


export default function Config({ apiUrl, token }) {
    const headers = { 'accept': 'application/json', 'Authorization': `Bearer ${token}` };
    const  handleSetConfig = (username, rating) => {
        const data = {rating: rating};
        axios.patch(`${apiUrl}/config`, data, 
        {headers: headers}).then(response => {
            console.log(response.data);
        }).catch(error => {
            console.error('Error setting config:', error);
        });

    // Set rating range
    return (
        <div>
            <h1>Settings</h1>
            <h2>Rating Range</h2>
            <p>Set the rating range for the app</p>
            <input type="number" placeholder="Minimum Rating" />
 
            <button onClick={handleSetConfig} 
                Set Minimum Rating</button>
        </div>
    )
} */
