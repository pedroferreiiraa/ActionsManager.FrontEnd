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
  conclusionText: string;
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
  const [expandedActions, setExpandedActions] = useState<number[]>([]);

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

  // Buscar as ações associadas ao projeto
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
            })
              .then((response) => {
                if (!response.ok) {
                  if (response.status === 404 || response.status === 500) {
                    console.warn(
                      `Ação ${actionId} não pôde ser buscada (status: ${response.status}). Ela pode ter sido deletada. Ignorando...`
                    );
                    return null; // Ignora essa ação
                  } else {
                    throw new Error(`Erro ao buscar a ação ${actionId}: ${response.status}`);
                  }
                }
                return response.json().then((actionData) => {
                  if (actionData && actionData.data && !actionData.data.isDeleted) {
                    return actionData.data; // Só retorna a ação se não estiver deletada
                  } else {
                    console.warn(`Ação ${actionId} foi deletada. Ignorando...`);
                    return null;
                  }
                });
              })
              .catch((error) => {
                console.error(`Erro ao buscar a ação ${actionId}: ${error.message}`);
                return null;
              })
          );

          const actionsData = await Promise.all(actionPromises);
          // Filtra para remover ações que foram ignoradas (null)
          const validActions = actionsData.filter((action) => action !== null);
          setActions(validActions as Action[]);
        } catch (error: any) {
          setError('Erro ao buscar as ações: ' + error.message);
        }
      } else {
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

  // Função para alternar a expansão das ações
  const toggleActionExpansion = (actionId: number) => {
    if (expandedActions.includes(actionId)) {
      setExpandedActions(expandedActions.filter((id) => id !== actionId));
    } else {
      setExpandedActions([...expandedActions, actionId]);
    }
  };

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
  

  const handleStartAction = async (actionId: number) => {
    try {
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }

      const url = `http://localhost:5000/api/actions/${actionId}/start`;

      const body = {
        id: actionId, // Inclui o ID da ação
        command: "StartAction" // Comando necessário pelo backend
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body) // Corpo da requisição
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao iniciar a ação: ${errorMessage}`);
      }

      // Atualiza o status da ação localmente
      setActions((prevActions) =>
        prevActions.map((action) =>
          action.id === actionId
            ? { ...action, status: 1, startedAt: new Date().toISOString() }
            : action
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCompleteAction = async (actionId: number) => {
    try {
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }

      const url = `http://localhost:5000/api/actions/${actionId}/complete`;

      const body = {
        id: actionId, // Inclui o ID da ação
        command: "CompleteAction" // Comando necessário pelo backend
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body) // Corpo da requisição
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao completar a ação: ${errorMessage}`);
      }

      // Atualiza o status da ação localmente
      setActions((prevActions) =>
        prevActions.map((action) =>
          action.id === actionId
            ? { ...action, status: 4, completedAt: new Date().toISOString() }
            : action
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteAction = async (actionId: number) => {
    try {
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }
  
      const url = `http://localhost:5000/api/actions/${actionId}/delete`;
  
      const body = {
        id: actionId
      };
  
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body) // Incluindo o corpo da requisição como esperado
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao deletar a ação: ${errorMessage}`);
      }
  
      // Atualiza o estado local removendo a ação deletada
      setActions((prevActions) =>
        prevActions.filter((action) => action.id !== actionId)
      );
  
      // Atualiza os actionIds no projeto
      if (project) {
        setProject({
          ...project,
          actionIds: project.actionIds.filter((id) => id !== actionId),
        });
      }
    } catch (error: any) {
      setError(error.message);
    }
  };
  
  const handleUpdateConclusion = async (actionId: number, conclusionText: string) => {
    try {
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }
  
      const url = `http://localhost:5000/api/actions/${actionId}`;
  
      const body = {
        id: actionId,
        conclusionText: conclusionText
      };
  
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body) // Incluindo apenas os campos necessários
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao atualizar a conclusão da ação: ${errorMessage}`);
      }
  
      // Atualiza o status da ação localmente
      setActions((prevActions) =>
        prevActions.map((action) =>
          action.id === actionId
            ? { ...action, conclusionText: conclusionText, status: 4, completedAt: new Date().toISOString() }
            : action
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleUpdateProject = async (updatedFields: Partial<Project>) => {
    if (project && (project.status === 0 || project.status === 1)) {
      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }

        const updateUrl = `http://localhost:5000/api/projects/${project.id}`;
        const updatedProject = {
          ...project,
          ...updatedFields,
        };

        const response = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedProject),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro ao atualizar o projeto: ${errorMessage}`);
        }

        // Atualiza os detalhes do projeto localmente após a atualização
        setProject(updatedProject);
      } catch (error: any) {
        setError(error.message);
      }
    } else {
      setError('O projeto só pode ser atualizado se estiver nos status "Criado" ou "Em Andamento".');
    }
  };

  const handleUpdateProjectNavigation = () => {
    if (project) {
      navigate(`/projeto/${project.id}/update`);
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
          <p className='font-bold mb-4'>Origem do projeto: {project.origin}</p>
          <p className='font-bold mb-4'>Número da Origem: {project.originNumber}</p>
          <p className="font-bold mb-4">Id do projeto: {project.id} </p>
          {/* <div className="mb-4">
            <span className="font-semibold">Número do Projeto: </span>
          </div> */}
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
            <h3 className="text-xl font-bold mb-2">Ações Associadas:</h3>
            {actions.length > 0 ? (
              <div className="mt-4">
                {actions.map((action) => (
                  <div key={action.id} className="mb-2 border-b border-gray-200">
                    <button
                      onClick={() => toggleActionExpansion(action.id)}
                      className="w-full text-left focus:outline-none py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">
                          {action.title}
                        </span>
                        <svg
                          className={`w-5 h-5 transform transition-transform ${
                            expandedActions.includes(action.id)
                              ? 'rotate-180'
                              : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>
                    {expandedActions.includes(action.id) && (
                      <div className="pl-4 pb-4 text-sm text-gray-700">
                        <p>
                          <strong>O que:</strong> {action.what}
                        </p>
                        <p>
                          <strong>Por que:</strong> {action.why}
                        </p>
                        <p>
                          <strong>Quando:</strong> {action.when}
                        </p>
                        <p>
                          <strong>Onde:</strong> {action.where}
                        </p>
                        <p>
                          <strong>Quem:</strong> {action.who}
                        </p>
                        <p>
                          <strong>Como:</strong> {action.how}
                        </p>
                        <p>
                          <strong>Quanto:</strong> {action.howMuch}
                        </p>
                        <p>
                          <strong>Status:</strong> {getStatusText(action.status)}
                        </p>
                        {/* Botões para ações */}
                        <div className="mt-4">
                          {action.status === 0 && (
                            <button
                              onClick={() => handleStartAction(action.id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none mr-2"
                            >
                              Iniciar Ação
                            </button>
                          )}
                          {action.status === 1 && (
                            <button
                              onClick={() => handleCompleteAction(action.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none mr-2"
                            >
                              Completar Ação
                            </button>
                          )}
                          {action.status !== 4 && (
                            <button
                              onClick={() => handleDeleteAction(action.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none"
                            >
                              Deletar Ação
                            </button>
                          )}
                          
                          {action.status === 4 && (
                          <div className="mt-4">
                            <label htmlFor={`conclusionText-${action.id}`} className="block text-sm font-bold mb-2">
                              Texto de Conclusão
                            </label>
                            <textarea
                              id={`conclusionText-${action.id}`}
                              value={action.conclusionText}
                              onChange={(e) =>
                                setActions((prevActions) =>
                                  prevActions.map((prevAction) =>
                                    prevAction.id === action.id
                                      ? { ...prevAction, conclusionText: e.target.value }
                                      : prevAction
                                  )
                                )
                              }
                              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleUpdateConclusion(action.id, action.conclusionText)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none mt-2"
                            >
                              Salvar Conclusão
                            </button>
                          </div>
                        )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
                  onClick={() => navigate(`/projeto/${project.id}/inserir-acao`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                >
                  Adicionar Ação
                </button>
              </>
            )}

            {project.status !== 4 && (
              <>
              <button
              onClick={handleDeleteProject}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4 focus:outline-none mr-4"
            >
              Deletar Projeto
            </button>
            </>
            )}

            {(project?.status === 0 || project?.status === 1) && (
                      <button
                        onClick={handleUpdateProjectNavigation}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 focus:outline-none mr-4"

                      >
                        Atualizar Projeto
                      </button>
                    )}
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Projeto não encontrado.</div>
      )}
    </div>
  );
};

export default ProjectDetails;
