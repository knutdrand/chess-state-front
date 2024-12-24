import React, {useEffect, useState} from "react";
import { Container, Navbar, Nav, Button, Image } from 'react-bootstrap';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

export function Navigation({activeTab,setActiveTab, handleLogout, userName}) {
  return (
      <Navbar className="mb-3 w-100 justify-content-between">
        <div>
        <Navbar.Brand>
          <Image src="/logo_new2.jpg" alt="Chess-State Logo" width={32} height={32} className="mr-2" />
          
        </Navbar.Brand>
        <Navbar.Text>{userName}</Navbar.Text>
        </div>
        <Nav activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
          <Nav.Item>
            <Nav.Link eventKey="play"><HomeIcon/></Nav.Link>
            
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="courses"><MenuIcon/></Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="settings"><SettingsIcon/></Nav.Link>
          </Nav.Item>
        </Nav>
        <Button onClick={handleLogout}><LogoutIcon/></Button>
      </Navbar>
  );
}
