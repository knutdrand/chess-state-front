import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
} from '@mui/material';
import { DefaultService } from '../../api';
import { useAuthStore } from '../../stores/authStore';

interface LoginProps {
  setIsRegistering: (value: boolean) => void;
}

export default function Login({ setIsRegistering }: LoginProps) {
  const setToken = useAuthStore((s) => s.setToken);
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await DefaultService.loginForAccessTokenApiTokenPost({
        username,
        password,
      });
      setToken(response.access_token);
    } catch (error) {
      setError('Invalid username or password');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Card sx={{ width: '24rem', p: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <img
              src="/logo192.png"
              alt="Chess-State Logo"
              width={64}
              height={64}
            />
          </Box>
          <Typography variant="h5" align="center" gutterBottom>
            Chess-State
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
              sx={{ mt: 1 }}
            >
              Submit
            </Button>
          </form>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
        <Box sx={{ textAlign: 'center', mt: 2, mb: 1 }}>
          Don't have an account?{' '}
          <Button
            variant="text"
            onClick={() => setIsRegistering(true)}
            sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
          >
            Register here
          </Button>
        </Box>
      </Card>
    </Container>
  );
}
