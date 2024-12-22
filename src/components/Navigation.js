import React, {useEffect, useState} from "react";
import { Container, Navbar, Nav, Button, Image } from 'react-bootstrap';

export function Navigation({activeTab,setActiveTab, handleLogout, userName}) {
  return (
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
            <Nav.Link eventKey="courses">Manage Courses</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="settings">Settings</Nav.Link>
          </Nav.Item>
        </Nav>
        <Navbar.Text>{userName}</Navbar.Text>
        <Button onClick={handleLogout}>Logout</Button>
      </Navbar>
  );
}
