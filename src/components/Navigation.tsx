import React from "react";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  userName: string;
}

export function Navigation({ activeTab, setActiveTab, handleLogout, userName }: NavigationProps) {
  return (
    <AppBar position="static" color="default">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src="/logo_new2.jpg" alt="Chess-State Logo" sx={{ width: 32, height: 32, mr: 2 }} />
          <Typography variant="h6" component="div">
            {userName}
          </Typography>
        </Box>

        {/* Center Section (Tabs) */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton 
            color={activeTab === 'play' ? 'primary' : 'default'} 
            onClick={() => setActiveTab('play')}
          >
            <HomeIcon />
          </IconButton>
          <IconButton 
            color={activeTab === 'courses' ? 'primary' : 'default'} 
            onClick={() => setActiveTab('courses')}
          >
            <MenuIcon />
          </IconButton>
          <IconButton 
            color={activeTab === 'settings' ? 'primary' : 'default'} 
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon />
          </IconButton>
        </Box>

        {/* Right Section */}
        <Button 
          variant="outlined" 
          startIcon={<LogoutIcon />} 
          onClick={handleLogout}
        >
        </Button>
      </Toolbar>
    </AppBar>
  );
}
