import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';
import axios from "axios";
import {apiUrl} from "../config";

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