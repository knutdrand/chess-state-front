import { Container, Form, Button, Alert, Card, Image } from 'react-bootstrap';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { apiUrl } from '../config';

async function registerUser(credentials) {
  return axios
    .post(apiUrl + '/register', new URLSearchParams(credentials), {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((response) => {
      return response.data;
    });
}

export default function Register({ setToken, setIsRegistering}) {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
    const [invitationCode, setInvitationCode] = useState('');   

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const token = await registerUser({
        grant_type: 'password',
        username: username,
        password: password,
        invitation_code: invitationCode,
        scope: '',
        client_id: '',
        client_secret: '',
      });
      setSuccess('User registered successfully. You can now log in.');
      setToken(token.access_token);
      setIsRegistering(false);
        
    } catch (error) {
      console.error('Error:', error);
      setError(
        error.response?.data?.detail || 'An error occurred during registration.'
      );
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: '24rem' }} className="p-4">
        <Card.Body>
          <div className="text-center mb-4">
            <Image src="/logo192.png" alt="Chess-State Logo" width={64} height={64} />
          </div>
          <Card.Title className="text-center">Register</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicConfirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
                          <Form.Text className={password === confirmPassword ? 'text-success' : 'text-danger'}>
  {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
</Form.Text>

            </Form.Group>
            <Form.Group controlId="formBasicInvitationCode" className="mb-3">
              <Form.Label>Invitation Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter invitation code"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Register
            </Button>
          </Form>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mt-3">
              {success}
            </Alert>
          )}
        </Card.Body>
        <div   className="text-center mt-3">
        Already have an account?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsRegistering(false);
          }}
          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
        >
            Login here
        </a>
        </div>

      </Card>
    </Container>
  );
}

Register.propTypes = {
  setToken: PropTypes.func.isRequired,
};
