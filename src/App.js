import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import useToken from './useToken';
import React, {useState} from 'react';
import {MainScreen} from "./components/MainScreen";
import Register from './components/register';
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
    <Router>
      <Routes>
          <Route path='/' element={<UserNameToGameScreen />} />
          <Route path='/register' element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App