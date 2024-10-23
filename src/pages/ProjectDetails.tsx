import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

interface Project {
  id: string;
  title: string;
  projectNumber: number;
  status: number;
  userId: number;
  originDate: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  isDeleted: boolean;
  description: string;
  actionIds: number[];
  origin: string;
  originNumber: number;
  conclusionText: string;
}

interface User {
  id: number;
  fullName: string;
}

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      navigate('/login');
    }
  }, [navigate]);

    useEffect(() => {
    // Função para buscar os detalhes do projeto e suas ações
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError('');

        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }

        const projectUrl = `http://localhost:5000/api/projects/${id}`;
        const projectResponse = await fetch(projectUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!projectResponse.ok) {
          throw new Error('Erro ao buscar os detalhes do projeto.');
        }

        const projectData = await projectResponse.json();
        if (projectData) {
          setProject(projectData);
        } else {
          throw new Error('Projeto não encontrado.');
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };



    
    const fetchUserDetails = async (userId: number) => {
      try {
        if (!userId) {
          throw new Error('ID do usuário inválido.');
        }

        const userUrl = `http://localhost:5000/api/users/${userId}`;

        const userResponse = await fetch(userUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          const errorDetail = await userResponse.json();
          throw new Error(
            `Erro ao buscar os detalhes do usuário: ${
              errorDetail.message || 'Usuário não encontrado'
            }`
          );
        }

        const userData = await userResponse.json();

        if (userData) {
          setUser(userData);
        } else {
          throw new Error('Usuário não encontrado.');
        }
      } catch (error: any) {
        setError('Erro ao buscar os detalhes do usuário: ' + error.message);
      }
    };

    if (token) {
      fetchProjectDetails();
    }
  }, [id, token, navigate]);


  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return 'Criado';
      case 1:
        return 'Em Andamento';
      case 2:
        return 'Suspenso';
      case 3:
        return 'Cancelado';
      case 4:
        return 'Concluído';
      default:
        return 'Desconhecido';
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg shadow-sm max-w-md">
          <p className="text-center">{error}</p>
        </div>
      </div>
    );
  }


  const handleStartProject = async () => {
    if (project) {
      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }
  
        const url = `http://localhost:5000/api/projects/${project.id}/start`;
  
        const body = {
          id: project.id, // Incluindo o ID do projeto no corpo da requisição para coincidir com o ID da URL
          command: "StartProject" // Incluindo o campo 'command' que o backend está exigindo
        };
  
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body) // Incluindo o corpo da requisição
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro ao iniciar o projeto: ${errorMessage}`);
        }
  
        // Atualiza o status do projeto localmente
        setProject({ ...project, status: 1, startedAt: new Date().toISOString() });
      } catch (error: any) {
        setError(error.message);
      }
    }
  };
  
  const handleCompleteProject = async () => {
    if (project) {
      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }
  
        const url = `http://localhost:5000/api/projects/${project.id}/complete`;
  
        const body = {
          conclusionText: conclusionText // Inclua o texto de conclusão no corpo da requisição
        };
  
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body) // Envie o corpo da requisição com conclusionText
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro ao completar o projeto: ${errorMessage}`);
        }
  
        // Atualiza o status do projeto localmente
        setProject({ ...project, status: 4, completedAt: new Date().toISOString() });
      } catch (error: any) {
        setError(error.message);
      }
    }
  };
  

  const handleDeleteProject = async () => {
    if (project) {
      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }
  
        const url = `http://localhost:5000/api/projects/${project.id}/delete`;
  
        const body = {
          id: project.id, // Incluindo o ID do projeto no corpo da requisição, caso seja necessário
          command: "DeleteProject"
        };
  
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body) // Incluindo o corpo da requisição
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro ao deletar o projeto: ${errorMessage}`);
        }
  
        // Navega de volta após a deleção
        navigate(-1);
      } catch (error: any) {
        setError(error.message);
      }
    }
  };
  

  const handleUpdateProjectNavigation = () => {
    if (project) {
      navigate(`/projeto/${project.id}/update`);
    }
  };


  return project ? (
    <div className="project-details-page">
      <h1>{project.title}</h1>
      <p>Status: {project.status}</p>
      <p>{project.description}</p>

      {/* Botões de ação do projeto */}
      <button onClick={handleStartProject}>Iniciar Projeto</button>
      <button onClick={handleCompleteProject}>Completar Projeto</button>
      <button onClick={handleDeleteProject}>Deletar Projeto</button>
      <button onClick={handleUpdateProjectNavigation}>Atualizar Projeto</button>

      {/* Ações do projeto */}
      {/* <ProjectActions projectId={project.id} actionIds={project.actionIds} token={token} /> */}
    </div>
  ) : <div>Projeto não encontrado</div>;
};

export default ProjectDetailsPage;
