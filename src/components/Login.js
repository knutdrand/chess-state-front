import { Container, Form, Button, Alert, Card, Image} from 'react-bootstrap';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';
import axios from "axios";
import {apiUrl} from "../config";
import { Link } from 'react-router-dom';


async function loginUser(credentials) {
  let response = await axios.post(apiUrl + '/token', new URLSearchParams(credentials), {headers: {
    'accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'}}
  ).then(
      (response) => {
        return response.data;
      }
    )
  return response;
}


export default function Login({ setToken, setIsRegistering}) {
  console.log(setIsRegistering);
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
    const [error, setError] = useState();
  const handleSubmit = async e => {
    e.preventDefault();
    return await loginUser({
        grant_type: 'password',
        username: username,
        password: password,
        scope: '',
        client_id: '',
        client_secret: ''
}).then((token) => {
    setToken(token.access_token)}).catch((error) => {
        console.log('Error: ' + error);
        console.log('Error: ' + error.response);
        setError('Error loggin in: ' + error);
        setToken(null);
    })
  }

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: '24rem' }} className="p-4">
        <Card.Body>
          <div className="text-center mb-4">
            <Image src="/logo192.png" alt="Chess-State Logo" width={64} height={64} />
          </div>
          <Card.Title className="text-center">Chess-State</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                onChange={(e) => setUserName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Submit
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
}
Login.propTypes = {
  setToken: PropTypes.func.isRequired
};
//</p>Dont' have an account? <Button onClick={() => setIsRegistering(true)} >Register</Button>