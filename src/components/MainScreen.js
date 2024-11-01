import React, {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {debounce} from "lodash";
import axios from "axios";

import {PlayerStatus} from "./PlayerStatus";
import {Info} from "./Info";
import {GameScreen} from "./GameScreen";

import Courses from './Courses'; // New component for course management
import { Container, Navbar, Nav, Button, Image } from 'react-bootstrap';
import {Chess} from "chess.js";
import {apiUrl} from "../config";
export function MainScreen({ token, setToken}) {
  const [mode, setMode] = useState('play');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState();
  const [link, setLink] = useState(null);
  const [boardWidth, setBoardWidth] = useState(400);
  const [activeTab, setActiveTab] = useState('play'); // Track active tab
  const decodedToken = jwtDecode(token);

  useEffect(() => {
    const updateBoardWidth = debounce(() => {
      const navHeight = 56;
      const maxBoardHeight = window.innerHeight - navHeight - 120;
      const maxBoardWidth = window.innerWidth - 20;
      setBoardWidth(Math.min(maxBoardHeight, maxBoardWidth));
    }, 100);

    updateBoardWidth();
    window.addEventListener('resize', updateBoardWidth);
    return () => window.removeEventListener('resize', updateBoardWidth);
  }, []);



  const handleLogout = () => {
    setToken(null);
  };

  return (
    <Container fluid className="d-flex flex-column align-items-center p-3 vh-100 bg-body-tertiary">
      <Navbar className="mb-3 w-100 justify-content-between">
        <Navbar.Brand>
          <Image src="/logo192.png" alt="Chess-State Logo" width={32} height={32} className="mr-2" />
          Chess State
        </Navbar.Brand>
        <Nav activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
          <Nav.Item>
            <Nav.Link eventKey="play">Play</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="courses">Courses</Nav.Link>
          </Nav.Item>
        </Nav>
        <Navbar.Text>{decodedToken.sub}</Navbar.Text>
        <Button onClick={handleLogout}>Logout</Button>
      </Navbar>

      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center w-100">
        {activeTab === 'play' ? (
          <GameScreen
            token={token}
            setToken={setToken}
            setScore={setScore}
            setFeedback={setFeedback}
            setLink={setLink}
            setMode={setMode}
            boardWidth={boardWidth}
            mode={mode}
          />
        ) : (
          <Courses apiUrl={apiUrl} token={token} />
        )}
        {activeTab === 'play' && (
          mode === 'play' ? (
            <PlayerStatus score={score} width={boardWidth} />
          ) : (
            <Info mode={mode} feedback={feedback} width={boardWidth} link={link} />
          )
        )}
      </div>
    </Container>
  );
}
//
//
// export function MainScreen({ token, setToken, apiUrl }) {
//   const [mode, setMode] = useState('play');
//   const [score, setScore] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [link, setLink] = useState(null);
//   const [boardWidth, setBoardWidth] = useState(400);
//   const [activeTab, setActiveTab] = useState('play'); // Track active tab
//   const decodedToken = jwtDecode(token);
//
//   useEffect(() => {
//     const updateBoardWidth = debounce(() => {
//       const navHeight = 56;
//       const maxBoardHeight = window.innerHeight - navHeight - 120;
//       const maxBoardWidth = window.innerWidth - 20;
//       setBoardWidth(Math.min(maxBoardHeight, maxBoardWidth));
//     }, 100);
//
//     updateBoardWidth();
//     window.addEventListener('resize', updateBoardWidth);
//     return () => window.removeEventListener('resize', updateBoardWidth);
//   }, []);
//
//   useEffect(() => {
//     //axios.post(`${apiUrl}/update_player/${decodedToken.sub}`);
//   }, [decodedToken, apiUrl]);
//
//   const handleLogout = () => {
//     setToken(null);
//   };
//
//   return (
//     <Container fluid className="d-flex flex-column align-items-center p-3 vh-100 bg-body-tertiary">
//       <Navbar className="mb-3 w-100 justify-content-between">
//         <Navbar.Brand>
//           <Image src="/logo192.png" alt="Chess-State Logo" width={32} height={32} className="mr-2" />
//           Chess State
//         </Navbar.Brand>
//         <Navbar.Text>{decodedToken.sub}</Navbar.Text>
//         <Nav className="ml-auto">
//           <Button onClick={handleLogout}>Logout</Button>
//         </Nav>
//       </Navbar>
//
//       <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="w-100">
//         <Tab eventKey="play" title="Play">
//           <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
//             <GameScreen
//               token={token}
//               setToken={setToken}
//               setScore={setScore}
//               setFeedback={setFeedback}
//               setLink={setLink}
//               setMode={setMode}
//               boardWidth={boardWidth}
//               mode={mode}
//             />
//             {mode === 'play' ? (
//               <PlayerStatus score={score} width={boardWidth} />
//             ) : (
//               <Info mode={mode} feedback={feedback} width={boardWidth} link={link} />
//             )}
//           </div>
//         </Tab>
//         <Tab eventKey="courses" title="Courses">
//           <Courses apiUrl={apiUrl} token={token} /> {/* New CoursesTab component */}
//         </Tab>
//       </Tabs>
//     </Container>
//   );
// }
// export default MainScreen;
//
