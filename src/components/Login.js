import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';
import axios from "axios";

async function loginUser(credentials) {
  // let body = new FormData();
  // body.append('grant_type', 'password');
  // body.append('username', credentials.username);
  // body.append('password', credentials.password);
  // body.append('scope', 'read write');
  // body.append('client_id', '');
  // body.append('client_secret', '');
  const baseUrl = false ? 'https://chess-state.vercel.app' : 'http://0.0.0.0:8000';
  let response = await axios.post(baseUrl + '/token', new URLSearchParams(credentials), {headers: {
    'accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'}}
  ).then(
      (response) => {
        return response.data;
      }
  )
  return response;
}


export default function Login({ setToken }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    const token = await loginUser({
  grant_type: '',
  username: username,
  password: password,
  scope: '',
  client_id: '',
  client_secret: ''
});
    let accessToken = token.access_token;
    setToken(accessToken);
  }

  return(
    <div className="login-wrapper">
      <h1>Please Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" onChange={e => setUserName(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input type="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
};