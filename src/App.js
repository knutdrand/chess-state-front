import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import useToken from './useToken';
import Container from '@mui/material/Container';
import React, {useState} from 'react';
import {MainScreen} from "./components/MainScreen";
import Register from './components/register';
import { Exploration } from './components/Exploration.tsx';
import {Exploration2, ExampleExploration} from './components/Exploration2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

const UserNameToGameScreen = () => {
  const { token, setToken } = useToken();
  const [isRegistering, setIsRegistering] = useState(false);
  console.log(setIsRegistering);
    if (token) {
        return <MainScreen token={token} setToken={setToken} />;
    }
    return (
        <div>
            {isRegistering ? <Register setToken={setToken} setIsRegistering={setIsRegistering}/> : <Login setToken={setToken} setIsRegistering={setIsRegistering} />}
        </div>
    )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path='/' element={<UserNameToGameScreen />} />
          <Route path='/register' element={<Register />} />
          <Route path='/exploration' element={<ExampleExploration/>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App
