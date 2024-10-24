  import React, { useEffect, useState } from 'react';
  import { useNavigate, useParams } from 'react-router-dom';
  import 'tailwindcss/tailwind.css';
  import ProjectActions from './ProjectActions';

  interface Project {
    id: number;
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

  const getStatusText = (status: number): string => {
    const statusMap: { [key: number]: string } = {
      0: 'Não Iniciado',
      1: 'Em Andamento',
      2: 'Pendente',
      3: 'Atrasado',
      4: 'Concluído'
    };
    return statusMap[status] || 'Status Desconhecido';
  };

  
  const ProjectDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const [showConclusionEditor, setShowConclusionEditor] = useState<boolean>(false);
    const [conclusionText, setConclusionText] = useState<string>('');
    const [projectConclusionText, setProjectConclusionText] = useState<string>('');

    

    useEffect(() => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        navigate('/login');
      }
    }, [navigate]);

    const fetchUserDetails = async (userId: number, token: string, setUser: Function, setError: Function) => {
      try {
        const userUrl = `http://localhost:5000/api/users/${userId}`;
        const userResponse = await fetch(userUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
      } catch (error: any) {
        setError(error.message);
      }
    };
    
    const fetchProjectDetails = async (
      id: number,
      token: string,
      setProject: Function,
      setConclusionText: Function,
      setProjectConclusionText: Function,
      setUser: Function,
      setError: Function,
      setLoading: Function
    ) => {
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
          setConclusionText(projectData.conclusionText || '');
          setProjectConclusionText(projectData.conclusionText || '');
    
          // Fetch user details if we have a userId
          if (projectData.userId) {
            await fetchUserDetails(projectData.userId, token, setUser, setError);
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

    useEffect(() => {
      if (token && id) {
        fetchProjectDetails(
          Number(id),
          token,
          setProject,
          setConclusionText,
          setProjectConclusionText,
          setUser,
          setError,
          setLoading
        );
      }
    }, [id, token]);

    const handleStartProject = async () => {
      if (project) {
        try {
          if (!token) {
            throw new Error('Token de autorização não encontrado.');
          }
    
          const url = `http://localhost:5000/api/projects/${project.id}/start`;
    
          const body = {
            id: project.id,
            command: "StartProject"
          };
    
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body)
          });
    
          if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao iniciar o projeto: ${errorMessage}`);
          }
    
          // Obter a resposta atualizada do servidor
          const updatedProject = await response.json();
          
          // Criar um novo objeto de projeto com todos os dados necessários
          const newProjectState = {
            ...project,
            ...updatedProject,
            status: 1, // Garantir que o status seja 1 (Em Andamento)
            startedAt: new Date().toISOString()
          };
    
          // Atualizar o estado do projeto
          setProject(newProjectState);
    
          // Log opcional para debug
          console.log('Projeto atualizado:', newProjectState);
    
        } catch (error: any) {
          setError(error.message);
          console.error('Erro ao iniciar projeto:', error);
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
            id: project.id,
            command: "CompleteProject",
            conclusionText: conclusionText
          };
    
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body)
          });
    
          if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao completar o projeto: ${errorMessage}`);
          }
    
          const updatedProject = await response.json();

          const newProjectState = {
            ...project,
            ...updatedProject,
            status: 4,
            completedAt: new Date().toISOString()
          }


          setProject(newProjectState);
          setProjectConclusionText(conclusionText);
          setShowConclusionEditor(false);
        } catch (error: any) {
          setError(error.message);
        }
      }
    };

    const handleSaveConclusionText = async (projectId: number, text: string) => {
      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }
  
        const url = `http://localhost:5000/api/projects/${projectId}/conclusion`;
  
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            projectId: projectId,
            conclusionText: text
          })
        });
  
        if (!response.ok) {
          throw new Error('Erro ao salvar o texto de conclusão.');
        }
  
        setProjectConclusionText(text);
        setShowConclusionEditor(false);
      } catch (error: any) {
        setError(error.message);
      }
    };

    const handleDeleteProject = async () => {
      if (!project || !window.confirm('Tem certeza que deseja deletar este projeto?')) {
        return;
      }

      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }
    
        const url = `http://localhost:5000/api/projects/${project.id}/delete`;
    
        const body = {
          id: project.id,
          command: "DeleteProject"
        };
    
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body)
        });
    
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro ao deletar o projeto: ${errorMessage}`);
        }
    
        navigate(-1);
      } catch (error: any) {
        setError(error.message);
      }
    };
    
    const handleUpdateProjectNavigation = () => {
      if (project) {
        navigate(`/projeto/${project.id}/update`);
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

    return project ? (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 px-5 py-3 rounded-lg hover:bg-gray-300 focus:outline-none shadow-md transition-all"
          >
            Voltar
          </button>
          
          <div className="flex gap-4">
            {project.status === 0 && (
              <button
                onClick={handleStartProject}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none"
              >
                Iniciar Projeto
              </button>
            )}
            {project.status === 1 && (
              <>
                <button
                  onClick={() => {
                    setShowConclusionEditor(true);
                    handleCompleteProject();
                  }}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 focus:outline-none"
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
            {project.status !== 4 && (
              <>
                <button
                  onClick={handleDeleteProject}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 focus:outline-none"
                >
                  Deletar Projeto
                </button>
                <button
                  onClick={handleUpdateProjectNavigation}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 focus:outline-none"
                >
                  Atualizar Projeto
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="mb-6">
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

          {project.status === 4 && (
          <div className="mt-8">
            {projectConclusionText ? (
              <div>
                <p className="font-bold text-lg">Conclusão do Projeto:</p>
                <p className="text-gray-700">{projectConclusionText}</p>
               
              </div>
            ) : showConclusionEditor ? (
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
                  rows={4}
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
              <button
                onClick={() => setShowConclusionEditor(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none"
              >
                Adicionar Texto de Conclusão
              </button>
            )}
          </div>
        )}
      <ProjectActions projectId={project.id} token={token} />
      </div>
    </div>
  ) : (
    <div className="text-gray-500">Projeto não encontrado.</div>
  );


   
  };

  export default ProjectDetailsPage;