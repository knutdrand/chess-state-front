import React from 'react';
import { AppBar, Toolbar, Tabs, Tab, Box, Button, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LogoutIcon from '@mui/icons-material/Logout';

export function Navigation({ activeTab, setActiveTab, userName, handleLogout }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Chess State
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ flexGrow: 1 }}
        >
          <Tab value="play" label="Play" icon={<SportsEsportsIcon />} iconPosition="start" />
          <Tab value="courses" label="Courses" icon={<MenuBookIcon />} iconPosition="start" />
          <Tab value="settings" label="Settings" icon={<SettingsIcon />} iconPosition="start" />
        </Tabs>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {userName}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleMenu}
            edge="end"
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}