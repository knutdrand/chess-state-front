import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './features/auth/Login';
import React, {lazy, Suspense, useState} from 'react';
import {MainScreen} from "./components/MainScreen";
import Register from './features/auth/Register';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuthStore } from './stores/authStore';
import { NotificationProvider } from './hooks/useNotification';
import { LoadingFallback } from './components/LoadingFallback';

const ExampleExploration = lazy(() =>
  import('./features/exploration/Exploration2').then((m) => ({ default: m.ExampleExploration }))
);

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path='/' element={<UserNameToGameScreen />} />
                <Route path='/register' element={<Register />} />
                <Route path='/exploration' element={<ExampleExploration/>} />
              </Routes>
            </Suspense>
          </Router>
        </NotificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App
