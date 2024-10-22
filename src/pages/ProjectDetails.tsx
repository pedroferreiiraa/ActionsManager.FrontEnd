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
}

interface User {
  id: number;
  fullName: string;
}

interface Action {
    id: number;
    title: string;
    what: string;
    why: string;
    when: string;
    where: string;
    who: string;
    how: string;
    howMuch: number;
    status: number;
    projectId: number;
    userId: number;
    isDeleted: boolean;
    // Adicione outros campos se necessário
  }
  

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
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
          if (projectData.userId) {
            await fetchUserDetails(projectData.userId);
          }
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

  // Fetch actions associated with the project
  useEffect(() => {
    const fetchActions = async () => {
      if (project && project.actionIds && project.actionIds.length > 0) {
        try {
          const actionPromises = project.actionIds.map((actionId) =>
            fetch(`http://localhost:5000/api/actions/${actionId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }).then((response) => {
              if (!response.ok) {
                throw new Error(
                  `Erro ao buscar a ação ${actionId}: ${response.status}`
                );
              }
              return response.json().then((actionData) => {
                if (actionData && actionData.data) {
                  return actionData.data; // Extrai os dados do campo 'data'
                } else {
                  throw new Error('Estrutura de resposta inesperada da API.');
                }
              });
            })
          );
  
          const actionsData = await Promise.all(actionPromises);
          setActions(actionsData);
        } catch (error: any) {
          setError('Erro ao buscar as ações: ' + error.message);
        }
      } else {
        // Se não houver actions, limpa o estado de ações
        setActions([]);
      }
    };
  
    if (token && project) {
      fetchActions();
    }
  }, [project, token]);
  

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

  // Handler for starting the project
  const handleStartProject = async () => {
    if (project) {
      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }

        const url = `http://localhost:5000/api/projects/${project.id}/start`;

        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro ao iniciar o projeto: ${errorMessage}`);
        }

        // Update the project status locally
        setProject({ ...project, status: 1, startedAt: new Date().toISOString() });
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  // Handler for completing the project
  const handleCompleteProject = async () => {
    if (project) {
      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }

        const url = `http://localhost:5000/api/projects/${project.id}/complete`;

        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro ao completar o projeto: ${errorMessage}`);
        }

        // Update the project status locally
        setProject({ ...project, status: 4, completedAt: new Date().toISOString() });
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  // Handler for deleting the project
  const handleDeleteProject = async () => {
    if (project) {
      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }

        const url = `http://localhost:5000/api/projects/${project.id}`;

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro ao deletar o projeto: ${errorMessage}`);
        }

        // Navigate back after deletion
        navigate(-1);
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mt-6 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none"
        >
          Voltar
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : project ? (
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
          <div className="mb-4">
            <span className="font-semibold">Número do Projeto: </span>
            {project.projectNumber}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Status: </span>
            <span className="inline-block px-3 py-1 text-sm font-semibold rounded-md">
              {getStatusText(project.status)}
            </span>
          </div>
          <div className="mb-4">
            <span className="font-semibold">Usuário Responsável: </span>
            {user ? user.fullName : 'Carregando...'}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Data de Origem: </span>
            {project.originDate}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Criado em: </span>
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Iniciado em: </span>
            {project.startedAt
              ? new Date(project.startedAt).toLocaleDateString()
              : 'Não Iniciado'}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Concluído em: </span>
            {project.completedAt
              ? new Date(project.completedAt).toLocaleDateString()
              : 'Não Concluído'}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Descrição: </span>
            {project.description}
          </div>
          <div className="mb-4">
  <span className="font-semibold">Ações Associadas: </span>
            {actions.length > 0 ? (
                <div className="mt-6">
                <h3 className="text-xl font-bold mb-2">Ações do Projeto:</h3>
                <ul className="list-disc list-inside">
                    {actions.map((action) => (
                    <li key={action.id} className="mb-4">
                        <h4 className="font-bold">{action.title}</h4>
                        <p><strong>O que:</strong> {action.what}</p>
                        <p><strong>Por que:</strong> {action.why}</p>
                        <p><strong>Quando:</strong> {action.when}</p>
                        <p><strong>Onde:</strong> {action.where}</p>
                        <p><strong>Quem:</strong> {action.who}</p>
                        <p><strong>Como:</strong> {action.how}</p>
                        <p><strong>Quanto:</strong> {action.howMuch}</p>
                        <p><strong>Status:</strong> {getStatusText(action.status)}</p>
                    </li>
                    ))}
                </ul>
                </div>
            ) : (
                <p className="mt-6">Este projeto não possui ações associadas.</p>
            )}
            </div>

          <div className="mt-6">
            {project.status === 0 && (
              <button
                onClick={handleStartProject}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none mr-4"
              >
                Iniciar Projeto
              </button>
            )}
            {project.status === 1 && (
              <>
                <button
                  onClick={handleCompleteProject}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none mr-4"
                >
                  Completar Projeto
                </button>
                <button
                  onClick={() => navigate(`/projetos/${project.id}/adicionar-acao`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                >
                  Adicionar Ação
                </button>
              </>
            )}
            <button
              onClick={handleDeleteProject}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none mr-4"
            >
              Deletar Projeto
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Projeto não encontrado.</div>
      )}
    </div>
  );
};

export default ProjectDetails;
