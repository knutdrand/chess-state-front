import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import useToken from './useToken';
import {MainScreen} from "./components/GameScreen";

const UserNameToGameScreen = () => {
    const { token, setToken } = useToken();
    if (token) {
        return <MainScreen token={token} setToken={setToken} />;
    }
    return (
        <div>
            <Login setToken={setToken} />
        </div>
    )
}

const App = () => {
  return (
    <Router>
      <Routes>
          <Route path='/' element={<UserNameToGameScreen />} />
      </Routes>
    </Router>
  );
};

export default App