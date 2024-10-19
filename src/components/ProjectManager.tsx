import React, { useState, useEffect } from 'react';
import {
  Button, Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  IconButton, CircularProgress, Typography, Menu, MenuItem
} from '@mui/material';
import { Add, Edit, Delete, PlayArrow, Done, MoreVert } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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

interface Project {
  id: number;
  title: string;
  projectNumber: number;
  userId: number;
  status: number;
  originDate: string;
}

const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [userId, setUserId] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null); // Para menu de ações
  const theme = useTheme();

  // Fetch the list of projects from the API using GET
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5168/api/projects', {
        method: 'GET',
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
        console.error('Resposta inesperada da API:', data);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken && decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]) {
        setUserId(Number(decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]));
      } else {
        console.error('Token JWT inválido ou sem o campo nameidentifier.');
      }
    }
    fetchProjects();
  }, []);

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setCurrentProject(project);
    } else {
      setCurrentProject({
        title: '',
        projectNumber: 0,
        userId: userId,
        status: 0, // Status "0" significa "criado"
        originDate: '',
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentProject({});
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await fetch(`http://localhost:5168/api/projects/${id}/delete`, { method: 'DELETE' });
      fetchProjects(); // Reload projects after deletion
    } catch (error) {
      console.error('Erro ao deletar o projeto:', error);
    }
  };

  const handleSubmitProject = async () => {
    try {
      if (currentProject.id) {
        await fetch(`http://localhost:5168/api/projects/${currentProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentProject),
        });
      } else {
        await fetch('http://localhost:5168/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentProject),
        });
      }
      handleCloseModal();
      fetchProjects();
    } catch (error) {
      console.error('Erro ao salvar o projeto:', error);
    }
  };

  const handleStartProject = async (id: number) => {
    try {
      await fetch(`http://localhost:5168/api/projects/${id}/start`, { method: 'PUT' });
      fetchProjects();
    } catch (error) {
      console.error('Erro ao iniciar o projeto:', error);
    }
  };

  const handleCompleteProject = async (id: number) => {
    try {
      await fetch(`http://localhost:5168/api/projects/${id}/complete`, { method: 'PUT' });
      fetchProjects();
    } catch (error) {
      console.error('Erro ao completar o projeto:', error);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, projectId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(projectId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleProjectAction = async (action: string) => {
    if (selectedProject) {
      try {
        await fetch(`http://localhost:5168/api/projects/${selectedProject}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        fetchProjects(); // Atualiza os projetos
      } catch (error) {
        console.error('Erro ao realizar ação no projeto:', error);
      } finally {
        handleCloseMenu();
      }
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Gerenciamento de Projetos
      </Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleOpenModal()}
        sx={{ mb: 2 }}
      >
        Adicionar Projeto
      </Button>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Número do Projeto</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Origem</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.id}</TableCell>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>{project.projectNumber}</TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell>{project.originDate}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleStartProject(project.id)} color="primary">
                      <PlayArrow />
                    </IconButton>
                    <IconButton onClick={() => handleCompleteProject(project.id)} color="success">
                      <Done />
                    </IconButton>
                    <IconButton onClick={() => handleOpenModal(project)} color="secondary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteProject(project.id)} color="error">
                      <Delete />
                    </IconButton>
                    <IconButton onClick={(e) => handleOpenMenu(e, project.id)}>
                      <MoreVert />
                    </IconButton>
                    {/* Menu de ações */}
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedProject === project.id}
                      onClose={handleCloseMenu}
                    >
                      <MenuItem onClick={() => handleProjectAction('action1')}>Ação 1</MenuItem>
                      <MenuItem onClick={() => handleProjectAction('action2')}>Ação 2</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth>
        <DialogTitle>{currentProject.id ? 'Editar Projeto' : 'Adicionar Projeto'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Título"
            value={currentProject.title || ''}
            onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Número do Projeto"
            type="number"
            value={currentProject.projectNumber || 0}
            onChange={(e) => setCurrentProject({ ...currentProject, projectNumber: Number(e.target.value) })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Data de Origem"
            type="date"
            value={currentProject.originDate || ''}
            onChange={(e) => setCurrentProject({ ...currentProject, originDate: e.target.value })}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSubmitProject} variant="contained">
            {currentProject.id ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManager;
