import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, MenuItem, Grid2 } from '@mui/material';
import ProjectManager from '../components/ProjectManager';

// Função para decodificar o token JWT
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

const HomePage: React.FC = () => {
  const [projectsCount, setProjectsCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string | number>('all');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [username, setUsername] = useState<string>('');

  // Recupera o userId e nome do usuário do token JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken && decodedToken["userName"]) {
        setUsername(decodedToken["userName"]);
      }
    }
  }, []);

  // Função para abrir o modal
  const handleOpen = () => {
    setOpen(true);
  };

  // Função para fechar o modal
  const handleClose = () => {
    setOpen(false);
  };

  // Função para buscar os projetos e filtrar
  const handleFilterProjects = (value: string | number) => {
    setFilter(value);
    // Aqui você pode adicionar lógica para buscar e filtrar os projetos pelo valor selecionado
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Grid2 container spacing={4}>
      
       



        {/* Componente de Gerenciamento de Projetos */}
        {/* <Grid2 item xs={12}>
          <ProjectManager />
        </Grid2> */}
      </Grid2>
    </Box>
  );
};

export default HomePage;
