import React, { useState, FormEvent } from 'react';
// Import components individually
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Image from 'react-bootstrap/Image';
import { api } from '../api/apiClient';
import './Login.css';

interface LoginProps {
  setToken: (token: string) => void;
  setIsRegistering: (isRegistering: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setToken, setIsRegistering }) => {
  const [username, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.login(username, password);
      setToken(response.access_token);
      api.setAuthToken(response.access_token);
    } catch (error: any) {
      setError('Invalid username or password');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: '24rem' }} className="p-4">
        <Card.Body>
          <div className="text-center mb-4">
            <Image src="/logo192.png" alt="Chess-State Logo" width={64} height={64} />
          </div>
          <Card.Title className="text-center">Login</Card.Title>
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

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
          
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Card.Body>
        
        <div className="text-center mt-3">
          Don't have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsRegistering(true);
            }}
            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
          >
            Register here
          </a>
        </div>
      </Card>
    </Container>
  );
};

export default Login;
