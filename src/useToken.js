import { useState } from 'react';
import {jwtDecode} from "jwt-decode";

export default function useToken() {
  const getToken = () => {
    const tokenString = localStorage.getItem('token');
    if (!tokenString || tokenString === 'null') {
      return null;
    }

    try {
      const userToken = JSON.parse(tokenString);
      if (!userToken) {
        return null;
      }

      const payLoad = jwtDecode(userToken);
      const expirationTime = payLoad.exp * 1000 - 60000;
      if (new Date().getTime() > expirationTime) {
        localStorage.removeItem('token');
        return null;
      }
      return userToken;
    } catch (error) {
      // Handle JSON parse errors or JWT decode errors
      localStorage.removeItem('token');
      return null;
    }
  };

  const [token, setToken] = useState(getToken());

  const saveToken = userToken => {
    localStorage.setItem('token', JSON.stringify(userToken));
    setToken(userToken);
  };

  return {
    setToken: saveToken,
    token
  }
}
