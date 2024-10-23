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
  }, [id, token]);





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
      <p><strong>Status:</strong> {project.status}</p>
      <p><strong>Número do Projeto:</strong> {project.projectNumber}</p>
      <p><strong>ID do Usuário:</strong> {project.userId}</p>
      <p><strong>Data de Origem:</strong> {project.originDate}</p>
      <p><strong>Criado em:</strong> {new Date(project.createdAt).toLocaleString()}</p>
      <p><strong>Iniciado em:</strong> {project.startedAt ? new Date(project.startedAt).toLocaleString() : 'Não Iniciado'}</p>
      <p><strong>Concluído em:</strong> {project.completedAt ? new Date(project.completedAt).toLocaleString() : 'Não Concluído'}</p>
      <p><strong>Descrição:</strong> {project.description}</p>
      <p><strong>Origem:</strong> {project.origin}</p>
      <p><strong>Número de Origem:</strong> {project.originNumber}</p>
      <p><strong>Texto de Conclusão:</strong> {project.conclusionText}</p>

      {/* Botões de ação do projeto */}
      <button onClick={handleStartProject}>Iniciar Projeto</button>
      <button onClick={handleCompleteProject}>Completar Projeto</button>
      <button onClick={handleDeleteProject}>Deletar Projeto</button>
      <button onClick={handleUpdateProjectNavigation}>Atualizar Projeto</button>

      {/* Ações do projeto */}
      <div>
        <h3>Ações:</h3>
        {project.actionIds.length > 0 ? (
          <ul>
            {project.actionIds.map((actionId) => (
              <li key={actionId}>Ação ID: {actionId}</li>
            ))}
          </ul>
        ) : (
          <p>Este projeto não possui ações associadas.</p>
        )}
      </div>
    </div>
  ) : (
    <div>Projeto não encontrado</div>
  );
};

export default ProjectDetailsPage;

