import React, { useState, useEffect } from 'react';
import { Button, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface JwtPayload {
  nameidentifier: string; // Assumindo que o ID do usuário está no campo 'nameidentifier'
  // Adicione outros campos conforme necessário
}

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

    return JSON.parse(jsonPayload); // Retorna o payload decodificado
  } catch (error) {
    console.error('Erro ao decodificar o token:', error);
    return null; // Retorna null se algo der errado
  }
}

const AddProjectModal: React.FC<{ open: boolean; handleClose: () => void }> = ({ open, handleClose }) => {
  const [title, setTitle] = useState('');
  const [projectNumber, setProjectNumber] = useState(0);
  const [userId, setUserId] = useState(0);
  const [status, setStatus] = useState(0);
  const [originDate, setOriginDate] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

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
    setStatus(0);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const projectData = {
      title,
      projectNumber,
      userId,
      status,
      originDate,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5168/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error('Erro ao criar o projeto');
      handleClose();
    } catch (error) {
      console.error('Erro ao criar o projeto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: theme.palette.grey[900], color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
        Adicionar Projeto
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Título"
            variant="outlined"
            margin="dense"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Número do Projeto"
            variant="outlined"
            margin="dense"
            type="number"
            value={projectNumber}
            onChange={(e) => setProjectNumber(Number(e.target.value))}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="ID do Usuário"
            variant="outlined"
            margin="dense"
            type="number"
            value={userId}
            disabled
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Status"
            variant="outlined"
            margin="dense"
            type="number"
            value={status}
            disabled
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Data de Origem"
            variant="outlined"
            margin="dense"
            type="date"
            value={originDate}
            onChange={(e) => setOriginDate(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" sx={{ color: theme.palette.grey[500] }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{
            backgroundColor: loading ? theme.palette.grey[600] : theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProjectModal;
