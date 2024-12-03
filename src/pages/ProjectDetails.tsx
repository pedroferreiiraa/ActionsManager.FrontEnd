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

  interface Action {
    id: number;
    status: number;
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
    const [actions, setActions] = useState<Action[]>([]);
    

    

    useEffect(() => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        navigate('/login');
      }
    }, [navigate]);

    const fetchUserDetails = async (userId: number) => {
      try {
        const userUrl = `http://192.168.16.194:5002/api/users/${userId}`;
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
        // eslint-disable-next-line
      } catch (error: any) {
        setError(error.message);
      }
    };
    
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError('');
  
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }
  
        const projectUrl = `http://192.168.16.194:5002/api/projects/${id}`;
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
        setProject(projectData);
        setConclusionText(projectData.conclusionText || '');
        setProjectConclusionText(projectData.conclusionText || '');
  
        if (projectData.userId) {
          await fetchUserDetails(projectData.userId);
        }
  
        if (projectData.actionIds && projectData.actionIds.length > 0) {
          await fetchAllActionsStatus(projectData.actionIds);
        }
        // eslint-disable-next-line
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    const fetchActionStatus = async (actionId: number): Promise<Action | null> => {
      try {
        const actionUrl = `http://192.168.16.194:5002/api/actions/${actionId}`;
        const actionResponse = await fetch(actionUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        if (actionResponse.ok) {
          const jsonResponse = await actionResponse.json();
      
          return jsonResponse.data || null;
        } else {
          throw new Error(`Erro ao buscar a ação com ID ${actionId}.`);
        }
        // eslint-disable-next-line
      } catch (error: any) {
        setError(error.message);
        return null;
      }
    };
    
   
    const fetchAllActionsStatus = async (actionIds: number[]) => {
      const actionsData = await Promise.all(actionIds.map(fetchActionStatus));
    
      // Filtrar ações válidas e atualizar o estado
      const validActions = actionsData.filter(action => action !== null) as Action[];
      setActions(validActions);
    
    };
  
    const allActionsCompleted = actions.every(action => action.status === 4);

    useEffect(() => {
      if (token && id) {
        fetchProjectDetails();
      }
    }, [id, token]);

    const handleStartProject = async () => {
      if (project) {
        try {
          if (!token) {
            throw new Error('Token de autorização não encontrado.');
          }
    
          const url = `http://192.168.16.194:5002/api/projects/${project.id}/start`;
    
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
    
          setProject(newProjectState);
    // eslint-disable-next-line
        } catch (error: any) {
          setError(error.message);
          console.error('Erro ao iniciar projeto:', error);
        }
      }
    };
    
    const handleCompleteProject = async () => {
      if (!allActionsCompleted) {
        setError("Todas as ações devem estar concluídas antes de finalizar o projeto");
        return;
      }
  
      if (project) {
        try {
          if (!token) {
            throw new Error('Token de autorização não encontrado.');
          }
  
          const url = `http://192.168.16.194:5002/api/projects/${project.id}/complete`;
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
          setProject({
            ...project,
            ...updatedProject,
            status: 4,
            completedAt: new Date().toISOString()
          });
          setProjectConclusionText(conclusionText);
          setShowConclusionEditor(false);
  // eslint-disable-next-line
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
  
        const url = `http://192.168.16.194:5002/api/projects/${projectId}/conclusion`;
  
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
        // eslint-disable-next-line
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
    
        const url = `http://192.168.16.194:5002/api/projects/${project.id}/delete`;
    
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
        // eslint-disable-next-line
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
<div className="p-8 max-w-6xl mx-auto sm:p p-1  ">
  <div className="flex justify-between items-center mb-6">
    <button
      onClick={() => navigate(-1)}
      className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all mt-2"
    >
      Voltar
    </button>
  </div>
  
  <div className="flex flex-col lg:flex-row gap-4">
  {project.status === 0 && (
    <button
      onClick={handleStartProject}
      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none w-full sm:w-auto"
    >
      Iniciar Projeto
    </button>
  )}
  {project.status === 1 && (
    <>
      <button
        onClick={handleCompleteProject}
        disabled={!allActionsCompleted}
        className={`px-6 py-3 rounded-lg sm:w-full w-48 focus:outline-none ${
          allActionsCompleted ? 'bg-green-500 text-white hover:bg-green-600 ' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Completar Projeto
      </button>
      
      <button
        onClick={() => navigate(`/projeto/${project.id}/inserir-acao`)}
        className="bg-blue-500 text-white px-6 py-3 sm:w-full w-48 rounded-lg hover:bg-blue-600 focus:outline-none"
      >
        Adicionar Ação
      </button>
    </>
  )}
  {project.status !== 4 && (
    <>
      <button
        onClick={handleDeleteProject}
        className="bg-red-500 text-white px-6 py-3 sm:w-full w-48 rounded-lg hover:bg-red-600 focus:outline-none"
      >
        Deletar Projeto
      </button>
      <button
        onClick={handleUpdateProjectNavigation}
        className="bg-yellow-500 text-white px-6 py-3 sm:w-full w-48 rounded-lg hover:bg-yellow-600 focus:outline-none"
      >
        Atualizar Projeto
      </button>
    </>
  )}
</div>



  <div className="bg-white p-8 rounded-lg shadow-lg">
    <div className="mb-6">
      <p className="font-bold text-lg">Status:</p>
      <p className="inline-block px-4 py-2 text-sm font-semibold bg-gray-100 rounded-lg shadow">
        {getStatusText(project.status)}
      </p>
    </div>

    <h1 className="text-2xl font-bold mb-8 text-center sm:text-lg">{project.title}</h1>
    
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
      <div>
        <p className="font-bold text-lg">Nº Do projeto:</p>
        <p className="text-gray-700">{project.id}</p>
      </div>
      <div>
        <p className="font-bold text-lg">Usuário Responsável:</p>
        <p className="text-gray-700">{user ? user.fullName : 'Carregando...'}</p>
      </div>
      <div>
        <p className="font-bold text-lg">Origem do projeto:</p>
        <p className="text-gray-700">{project.origin}</p>
      </div>
      <div>
        <p className="font-bold text-lg">Número da Origem:</p>
        <p className="text-gray-700">{project.originNumber}</p>
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