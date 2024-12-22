
import axios from 'axios';
import { apiUrl } from '../config';

import React, { useState } from 'react';

const Config = ({token}) => {
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const headers = { 'accept': 'application/json', 'Authorization': `Bearer ${token}` };
  const handleSubmit = async () => {
    if (rating === '') {
      setMessage('Rating cannot be empty');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
        console.log('headers:', headers);
        axios.patch(`${apiUrl}/player-config`, {rating: rating}, {headers: headers}).then(response => {
            console.log(response.data);
        }).catch(error => {
            console.error('Error setting config:', error);
        });
        

      //const data = await response.json();
      //setMessage(`Success: ${data.message}`);
    } catch (error) {
      setMessage('Error updating configuration');
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