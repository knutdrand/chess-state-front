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
  FormHelperText,
} from '@mui/material';
import { DefaultService } from '../../api';
import { useAuthStore } from '../../stores/authStore';

interface RegisterProps {
  setIsRegistering?: (value: boolean) => void;
}

export default function Register({ setIsRegistering }: RegisterProps) {
  const setToken = useAuthStore((s) => s.setToken);
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await DefaultService.registerUserApiRegisterPost({
        username,
        password,
        invitation_code: invitationCode,
        grant_type: 'password',
      });
      setSuccess('User registered successfully. You can now log in.');
      setToken(response.access_token);
      setIsRegistering?.(false);
    } catch (err: any) {
      console.error('Error:', err);
      setError(
        err.response?.data?.detail || 'An error occurred during registration.'
      );
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
            Register
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
            <TextField
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              helperText={
                <FormHelperText
                  component="span"
                  sx={{
                    color: password === confirmPassword ? 'success.main' : 'error.main',
                    m: 0,
                  }}
                >
                  {password === confirmPassword
                    ? 'Passwords match'
                    : 'Passwords do not match'}
                </FormHelperText>
              }
            />
            <TextField
              label="Invitation Code"
              type="text"
              placeholder="Enter invitation code"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{ mt: 1 }}
            >
              Register
            </Button>
          </form>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </CardContent>
        <Box sx={{ textAlign: 'center', mt: 2, mb: 1 }}>
          Already have an account?{' '}
          <Button
            variant="text"
            onClick={() => setIsRegistering?.(false)}
            sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
          >
            Login here
          </Button>
        </Box>
      </Card>
    </Container>
  );
}
