import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './features/auth/Login';
import React, {useState} from 'react';
import {MainScreen} from "./components/MainScreen";
import Register from './features/auth/Register';
import {ExampleExploration} from './features/exploration/Exploration2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { NotificationProvider } from './hooks/useNotification';

// Create a client
const queryClient = new QueryClient();

const UserNameToGameScreen = () => {
  const token = useAuthStore((s) => s.token);
  const [isRegistering, setIsRegistering] = useState(false);
    if (token) {
        return <MainScreen />;
    }
    return (
        <div>
            {isRegistering ? <Register setIsRegistering={setIsRegistering}/> : <Login setIsRegistering={setIsRegistering} />}
        </div>
    )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path='/' element={<UserNameToGameScreen />} />
            <Route path='/register' element={<Register />} />
            <Route path='/exploration' element={<ExampleExploration/>} />
          </Routes>
        </Router>
      </NotificationProvider>
    </QueryClientProvider>
  );
};

export default App
