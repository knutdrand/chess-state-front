import React, { useState, FormEvent } from 'react';
// Import components individually
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Image from 'react-bootstrap/Image';
import { api } from '../api/apiClient';

interface RegisterProps {
  setToken: (token: string) => void;
  setIsRegistering: (isRegistering: boolean) => void;
}

const Register: React.FC<RegisterProps> = ({ setToken, setIsRegistering }) => {
  const [username, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [invitationCode, setInvitationCode] = useState<string>('');   

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await api.register(username, password, invitationCode);
      setSuccess('User registered successfully. You can now log in.');
      setToken(response.access_token);
      setIsRegistering(false);
    } catch (error: any) {
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
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicConfirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
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
                required
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
        
        <div className="text-center mt-3">
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
};

export default Register;
