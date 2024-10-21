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
    actionIds: string[];
}

interface User {
    id: number;
    fullName: string;
}

const ProjectDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Pega o ID do projeto da URL
    const [project, setProject] = useState<Project | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                setLoading(true);
                setError('');
    
                const projectUrl = `http://localhost:5000/api/projects/${id}`;
                
                const projectResponse = await fetch(projectUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
    
                if (!projectResponse.ok) {
                    throw new Error('Erro ao buscar os detalhes do projeto.');
                }
    
                const projectData = await projectResponse.json();
    
                if (projectData && projectData.data) {
                    setProject(projectData.data);
                    if (projectData.data.userId) {
                        await fetchUserDetails(projectData.data.userId); // Busca o nome do usuário
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
                // Garantir que o ID do usuário é válido antes de fazer a requisição
                if (!userId) {
                    throw new Error("ID do usuário inválido.");
                }
        
                console.log('Buscando usuário com ID:', userId);
        
                const userUrl = `http://localhost:5000/api/users/${userId}`;
                
                const userResponse = await fetch(userUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
        
                if (!userResponse.ok) {
                    const errorDetail = await userResponse.json();
                    console.error('Erro na resposta da requisição ao usuário:', errorDetail);
                    throw new Error(`Erro ao buscar os detalhes do usuário: ${errorDetail.message || 'Usuário não encontrado'}`);
                }
        
                const userData = await userResponse.json();
        
                console.log('Usuário encontrado:', userData);
        
                if (userData) {
                    setUser(userData);
                } else {
                    throw new Error('Usuário não encontrado.');
                }
            } catch (error: any) {
                console.error('Erro ao buscar os detalhes do usuário:', error.message);
                setError('Erro ao buscar os detalhes do usuário: ' + error.message);
            }
        };
        
    
        fetchProjectDetails();
    }, [id]);
    
    

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

    const handleStartProject = async () => {
        if (project) {
            try {
                // Verifique se o token está presente
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token de autorização não encontrado.');
                }
    
                const url = `http://localhost:5000/api/projects/${project.id}/start`;
    
                // Definindo o corpo da requisição
                const body = {
                    id: project.id, // ID do projeto que queremos iniciar
                    command: "StartProject" // Campo `command` necessário pelo backend
                };
    
                console.log('Enviando requisição para iniciar projeto:', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                });
    
                // Fazendo a requisição ao backend
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                });
    
                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(`Erro ao iniciar o projeto: ${errorMessage}`);
                }
    
                // Se a resposta tiver algum conteúdo, tente convertê-la para JSON
                let updatedProject = null;
                const responseText = await response.text(); // Lê a resposta como texto
    
                if (responseText) {
                    updatedProject = JSON.parse(responseText); // Se houver texto, converte para JSON
                }
    
                // Atualize o estado se o projeto foi iniciado com sucesso
                if (updatedProject && updatedProject.isSuccess) {
                    setProject({ ...project, status: 1, startedAt: new Date().toISOString() });
                } else if (!updatedProject) {
                    // Caso a resposta esteja vazia, consideramos a operação como bem-sucedida
                    setProject({ ...project, status: 1, startedAt: new Date().toISOString() });
                }
            } catch (error: any) {
                setError(error.message);
            }
        }
    };
    

    
    const handleCompleteProject = async () => {
        if (project) {
            try {
                // Verifique se o token está presente
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token de autorização não encontrado.');
                }
    
                const url = `http://localhost:5000/api/projects/${project.id}/complete`;
    
                // Definindo o corpo da requisição
                const body = {
                    id: project.id, // ID do projeto que queremos completar
                    command: "CompleteProject" // Campo `command` necessário pelo backend
                };
    
                console.log('Enviando requisição para completar projeto:', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                });
    
                // Fazendo a requisição ao backend
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body), // Incluindo o corpo da requisição
                });
    
                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(`Erro ao completar o projeto: ${errorMessage}`);
                }
    
                // Se a resposta tiver algum conteúdo, tente convertê-la para JSON
                let updatedProject = null;
                const responseText = await response.text(); // Lê a resposta como texto
    
                if (responseText) {
                    updatedProject = JSON.parse(responseText); // Se houver texto, converte para JSON
                }
    
                // Atualize o estado se o projeto foi completado com sucesso
                if (updatedProject && updatedProject.isSuccess) {
                    setProject({ ...project, status: 4, completedAt: new Date().toISOString() });
                } else if (!updatedProject) {
                    // Caso a resposta esteja vazia, consideramos a operação como bem-sucedida
                    setProject({ ...project, status: 4, completedAt: new Date().toISOString() });
                }
            } catch (error: any) {
                setError(error.message);
            }
        }
    };
    
    
    

    const handleDeleteProject = async () => {
        if (project) {
            try {
                // Verifique se o token está presente
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token de autorização não encontrado.');
                }
    
                const url = `http://localhost:5000/api/projects/${project.id}/delete`;
    
                // Definindo o corpo da requisição
                const body = {
                    id: project.id, // ID do projeto que queremos deletar
                    command: "DeleteProject" // Campo `command` necessário pelo backend
                };
    
                console.log('Enviando requisição para deletar projeto:', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                });
    
                // Fazendo a requisição ao backend com um corpo
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body), // Incluindo o corpo da requisição
                });
    
                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(`Erro ao deletar o projeto: ${errorMessage}`);
                }
    
                // Se a resposta tiver algum conteúdo, tente convertê-la para JSON
                let deleteResponse = null;
                const responseText = await response.text(); // Lê a resposta como texto
    
                if (responseText) {
                    deleteResponse = JSON.parse(responseText); // Se houver texto, converte para JSON
                }
    
                // Se a resposta foi bem-sucedida, redireciona o usuário
                if (deleteResponse && deleteResponse.isSuccess) {
                    navigate(-1); // Volta para a página anterior após deletar
                } else if (!deleteResponse) {
                    // Caso a resposta esteja vazia, assumimos que a operação foi bem-sucedida
                    navigate(-1);
                }
            } catch (error: any) {
                setError(error.message);
            }
        }
    };
    
    

    return (
        <div className="p-6 max-w-4xl mx-auto">
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
                        <span className="font-semibold">Número do Projeto: </span>{project.projectNumber}
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Status: </span>
                        <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-md`}>
                            {getStatusText(project.status)}
                        </span>
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Usuário Responsável: </span>
                        {user ? user.fullName : 'Carregando...'}
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Data de Origem: </span>{project.originDate}
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Criado em: </span>{new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Iniciado em: </span>{project.startedAt ? new Date(project.startedAt).toLocaleDateString() : 'Não Iniciado'}
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Concluído em: </span>{project.completedAt ? new Date(project.completedAt).toLocaleDateString() : 'Não Concluído'}
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Descrição: </span>{project.description}
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Ações Associadas: </span>
                        {project.actionIds && project.actionIds.length > 0 ? (
                            <ul className="list-disc list-inside">
                                {project.actionIds.map((actionId) => (
                                    <li key={actionId}>Ação ID: {actionId}</li>
                                ))}
                            </ul>
                        ) : (
                            <span>Nenhuma ação associada.</span>
                        )}
                    </div>
                    <div className="mt-6">
                        {project.status === 0 && (
                            <button
                                onClick={handleStartProject}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none mr-4"
                            >
                                Iniciar Projeto
                            </button>
                        )}
                        {project.status === 1 && (
                            <button
                                onClick={handleCompleteProject}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none mr-4"
                            >
                                Completar Projeto
                            </button>
                        )}
                        <button
                            onClick={handleDeleteProject}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none mr-4"
                        >
                            Deletar Projeto
                        </button>
                        <button
                            onClick={() => navigate(`/projeto/${project.id}/inserir-acao`)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 focus:outline-none"
                        >
                            Inserir Ação
                        </button>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none"
                        >
                            Voltar
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
