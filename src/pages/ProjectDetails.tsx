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
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [expandedActions, setExpandedActions] = useState<number[]>([]);
  const [conclusionText, setConclusionText] = useState<string>('');
  const [showConclusionEditor, setShowConclusionEditor] = useState<boolean>(true);
  const [projectConclusionText, setProjectConclusionText] = useState<string>('');
  const [showConclusionActionEditor, setShowConclusionActionEditor] = useState<boolean>(true);
  const [actionConclusionText, setActionConclusionText] = useState<string>('');

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
          // Se o projeto já tiver um texto de conclusão, atualize o estado e esconda o editor
          if (projectData.conclusionText) {
            setProjectConclusionText(projectData.conclusionText);
            setShowConclusionEditor(false);
          }
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
                    return null;
                  } else {
                    throw new Error(`Erro ao buscar a ação ${actionId}: ${response.status}`);
                  }
                }
                return response.json().then((actionData) => {
                  if (actionData && actionData.data && !actionData.data.isDeleted) {
                    // Adiciona o estado do editor com base na existência do texto de conclusão
                    return {
                      ...actionData.data,
                      showConclusionEditor: !actionData.data.conclusionText
                    };
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
  
      const url = `http://localhost:5000/api/actions/${actionId}/conclusion`;
  
      const body = {
        id: actionId,
        conclusionText: conclusionText
      };
  
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body)
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao atualizar a conclusão da ação: ${errorMessage}`);
      }
  
      // Atualiza o estado da ação localmente
      setActions((prevActions) =>
        prevActions.map((action) =>
          action.id === actionId
            ? { 
                ...action, 
                conclusionText: conclusionText,
                status: 4,
                completedAt: new Date().toISOString(),
                showConclusionEditor: false // Esconde o editor após salvar
              }
            : action
        )
      );
      
    } catch (error: any) {
      setError(error.message);
    }
  };
  const handleSaveConclusionText = async (projectId: string, conclusionText: string) => {
    try {
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }

      const url = `http://localhost:5000/api/projects/${projectId}/conclusion`;

      const body = {
        projectId: parseInt(projectId),
        conclusionText: conclusionText
      };

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao salvar o texto de conclusão: ${errorMessage}`);
      }

      // Atualiza o estado local
      setProjectConclusionText(conclusionText);
      setShowConclusionEditor(false);

      // Atualiza o projeto localmente
      if (project) {
        setProject({
          ...project,
          conclusionText: conclusionText
        });
      }

    } catch (error: any) {
      setError(error.message);
    }
  };
  


  const handleUpdateProjectNavigation = () => {
    if (project) {
      navigate(`/projeto/${project.id}/update`);
    }
  };


  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-700 px-5 py-3 rounded-lg hover:bg-gray-300 focus:outline-none shadow-md transition-all"
        >
          Voltar
        </button>
        {project && project.status === 0 && (
          <button
            onClick={handleStartProject}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Iniciar Projeto
          </button>
        )}
        {project && project.status === 1 && (
          <>
        

            <button
              onClick={handleCompleteProject}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 focus:outline-none mr-4"
            >
              Completar Projeto
            </button>
            <button
              onClick={() => navigate(`/projeto/${project.id}/inserir-acao`)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Adicionar Ação
            </button>
          </>
        )}
        {project && project.status !== 4 && (
          <button
            onClick={handleDeleteProject}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 focus:outline-none"
          >
            Deletar Projeto
          </button>
        )}
        {project && (project?.status === 0 || project?.status === 1) && (
          <button
            onClick={handleUpdateProjectNavigation}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 focus:outline-none"
          >
            Atualizar Projeto
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : project ? (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div>
              <p className="font-bold text-lg">Status:</p>
              <p className="inline-block px-4 py-2 text-sm font-semibold bg-gray-100 rounded-lg shadow">
                {getStatusText(project.status)}
              </p>
            </div>
          <h1 className="text-4xl font-bold mb-8 text-center">{project.title}</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p className="font-bold text-lg">Origem do projeto:</p>
              <p className="text-gray-700">{project.origin}</p>
            </div>
            <div>
              <p className="font-bold text-lg">Número da Origem:</p>
              <p className="text-gray-700">{project.originNumber}</p>
            </div>
            <div>
              <p className="font-bold text-lg">Id do projeto:</p>
              <p className="text-gray-700">{project.id}</p>
            </div>
            
            <div>
              <p className="font-bold text-lg">Usuário Responsável:</p>
              <p className="text-gray-700">{user ? user.fullName : 'Carregando...'}</p>
            </div>
            <div>
              <p className="font-bold text-lg">Data de Origem:</p>
              <p className="text-gray-700">{project.originDate}</p>
            </div>
            <div>
              <p className="font-bold text-lg">Criado em:</p>
              <p className="text-gray-700">{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-bold text-lg">Iniciado em:</p>
              <p className="text-gray-700">
                {project.startedAt
                  ? new Date(project.startedAt).toLocaleDateString()
                  : 'Não Iniciado'}
              </p>
            </div>
            <div>
              <p className="font-bold text-lg">Concluído em:</p>
              <p className="text-gray-700">
                {project.completedAt
                  ? new Date(project.completedAt).toLocaleDateString()
                  : 'Não Concluído'}
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="font-bold text-lg">Descrição:</p>
            <p className="text-gray-700">{project.description}</p>
          </div>

          {project?.status === 4 && (
        <div className="mt-8">
          {showConclusionEditor ? (
            <>
              <label htmlFor="conclusionText" className="block text-lg font-bold mb-2">
                Texto de Conclusão:
              </label>
              <textarea
                id="conclusionText"
                value={conclusionText}
                onChange={(e) => setConclusionText(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Digite o texto de conclusão do projeto"
              />
              <button
                type="button"
                onClick={() => handleSaveConclusionText(project.id, conclusionText)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none"
              >
                Salvar Texto de Conclusão
              </button>
            </>
          ) : (
            <div className="mt-8">
              <p className="font-bold text-lg">Conclusão do Projeto:</p>
              <p className="text-gray-700">{projectConclusionText}</p>
            </div>
          )}
        </div>
      )}

  
          <div className="mt-8">
            <h3 className="text-3xl font-bold mb-4">Ações do projeto:</h3>
            {actions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
                <div>
                  
                </div>
                {actions.map((action) => (
                  <div key={action.id} className="border border-gray-200 p-4 rounded-lg shadow">
                    <button
                      onClick={() => toggleActionExpansion(action.id)}
                      className="w-full text-left focus:outline-none text-lg font-semibold flex justify-between items-center"
                    >
                      <span>{action.title}</span>
                      <svg
                        className={`w-6 h-6 transform transition-transform ${
                          expandedActions.includes(action.id) ? 'rotate-180' : ''
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
                    </button>
                    {expandedActions.includes(action.id) && (
                      <div className="mt-4 text-gray-700 text-md space-y-2">
                        <p><strong>O que:</strong> {action.what}</p>
                        <p><strong>Por que:</strong> {action.why}</p>
                        <p><strong>Quando:</strong> {action.when}</p>
                        <p><strong>Onde:</strong> {action.where}</p>
                        <p><strong>Quem:</strong> {action.who}</p>
                        <p><strong>Como:</strong> {action.how}</p>
                        <p><strong>Quanto:</strong> {action.howMuch}</p>
                        <p><strong>Status:</strong> {getStatusText(action.status)}</p>
                        
                        <div className="mt-4 flex space-x-4">
                          {action.status === 0 && (
                            <button
                              onClick={() => handleStartAction(action.id)}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                            >
                              Iniciar Ação
                            </button>
                          )}
                          {action.status === 1 && (
                            <button
                              onClick={() => handleCompleteAction(action.id)}
                              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none"
                            >
                              Completar Ação
                            </button>
                          )}
                          {action.status !== 4 && (
                            <button
                              onClick={() => handleDeleteAction(action.id)}
                              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none"
                            >
                              Deletar Ação
                            </button>
                          )}
                        </div>
  
                         {action.status === 4 && (
                      <div className="mt-4">
                        {action.showConclusionEditor ? (
                          <>
                            <label htmlFor={`conclusionText-${action.id}`} className="block text-sm font-bold mb-2">
                              Texto de Conclusão
                            </label>
                            <textarea
                              id={`conclusionText-${action.id}`}
                              value={action.conclusionText || ''}
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
                              onClick={() => handleUpdateConclusion(action.id, action.conclusionText || '')}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none mt-2"
                            >
                              Salvar Conclusão
                            </button>
                          </>
                        ) : (
                          <div>
                            <p className="font-bold text-sm mb-1">Conclusão:</p>
                            <p className="text-gray-700">{action.conclusionText}</p>
                          </div>
                        )}
                      </div>
                    )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-gray-500">Este projeto não possui ações associadas.</p>
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
