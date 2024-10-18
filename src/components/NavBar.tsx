// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, useEffect } from 'react';


function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); 
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar o token:', error);
    return null;
  }
}

const Navbar: React.FC = () => {
  // State to manage the visibility of the dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [username, setUsername] = useState<string>('');

  // Function to handle the opening of the menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Set the current target element as the anchor for the menu
  };

  // Function to handle the closing of the menu
  const handleMenuClose = () => {
    setAnchorEl(null); // Set anchorEl to null to close the menu
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken && decodedToken["userName"]) {
        setUsername(decodedToken["userName"]);
      }
    }
  }, []);

  return (
    // AppBar is the main container for the Navbar
    <AppBar position="static" color="primary">
      <Toolbar>
      
        
        <IconButton
          size="large"
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl} // Anchor element for positioning the menu
          open={Boolean(anchorEl)} // Boolean to control whether the menu is open
          onClose={handleMenuClose} // Function to close the menu
        >
          {/* Menu item for navigating to the profile page */}
          <MenuItem component={Link} to="/projects" onClick={handleMenuClose}>
            Listar projetos
          </MenuItem>
          {/* Menu item for navigating to the settings page */}
          <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>
            Adicionar projetos
          </MenuItem>
          {/* Menu item for logging out */}
          <MenuItem component={Link} to="/logout" onClick={handleMenuClose}>
            Sair
          </MenuItem>
        </Menu>


        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
    
        </Typography>


  
        
        <Typography variant="h5" component="div">
            Olá,  {username || 'Usuário'}
        </Typography>
        
       
        
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
