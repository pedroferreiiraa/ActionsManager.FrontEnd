import React, { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaProjectDiagram, FaCheckCircle } from 'react-icons/fa';

interface Project {
  id: string;
  title: string;
  status: number; // Adicionado para identificar o status do projeto
  isDeleted: boolean; // Adicionado para poder filtrar projetos deletados
}

interface User {
  id: string;
  fullName: string;
}

interface Action {
  id: string;
  userId: string;
  projectId: string;
}

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Invalid token');
    return null;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      const decoded = decodeJWT(token);
      setUserId(decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null);
    }

    // Buscar projetos
    fetch('http://localhost:5000/api/projects?pageNumber=1&pageSize=50', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          // Filtrar projetos que não foram deletados
          const filteredProjects = data.data.filter((project: Project) => !project.isDeleted);
          setProjects(filteredProjects);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });

    // Buscar ações
    fetch('http://localhost:5000/api/actions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setActions(data.data);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching actions:', error);
      });

    // Buscar usuários
    fetch('http://localhost:5000/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });

  }, []);

  // Função para pegar o título do projeto
  const getProjectTitle = (projectId: string) => {
    const project = projects.find((project) => project.id === projectId);
    return project ? project.title : 'Projeto Desconhecido';
  };

  // Função para pegar o nome completo do usuário
  const getUserFullName = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.fullName : 'Usuário Desconhecido';
  };

  // Filtrar projetos concluídos
  const completedProjectsCount = projects.filter((project) => project.status === 4).length;

  // Filtrar projetos em andamento (status diferente de "Concluído" (4))
  const ongoingProjectsCount = projects.filter((project) => project.status !== 4).length;

  return (
    <div className="p-4 md:p-6">
      {/* Boas-vindas e atalhos */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
          <button onClick={() => navigate('/adicionar-projeto')} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 focus:outline-none md:px-4 md:py-2">
            Adicionar Projeto
          </button>
          <button onClick={() => navigate('/listar-projetos')} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 focus:outline-none md:px-4 md:py-2">
            Listar Projetos
          </button>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="bg-gray-100 p-2 md:p-4 rounded flex items-center">
          <FaProjectDiagram className="text-3xl md:text-4xl text-blue-500 mr-2 md:mr-4" />
          <div>
            <h2 className="text-lg md:text-xl font-bold">{ongoingProjectsCount}</h2>
            <p className="text-sm md:text-base font-bold">Projetos em andamento</p>
          </div>
        </div>
        <div className="bg-gray-100 p-2 md:p-4 rounded flex items-center">
          <FaCheckCircle className="text-3xl md:text-4xl text-green-500 mr-2 md:mr-4" />
          <div>
            <h2 className="text-lg md:text-xl font-bold">{completedProjectsCount}</h2>
            <p className="text-sm md:text-base font-bold">Projetos Concluídos</p>
          </div>
        </div>
        <div className="bg-gray-100 p-2 md:p-4 rounded flex items-center">
          <FaChartBar className="text-3xl md:text-4xl text-blue-500 mr-2 md:mr-4" />
          <div>
            <h2 className="text-lg md:text-xl font-bold">{actions.length}</h2>
            <p className="text-sm md:text-base font-bold">Ações realizadas</p>
          </div>
        </div>
      </div>

      {/* Últimos projetos adicionados */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Últimos Projetos Adicionados</h2>
        <div className="bg-white p-2 md:p-4 rounded shadow">
          <ul>
            {projects.slice(0, 5).map((project) => (
              <li key={project.id} className="flex flex-col md:flex-row md:justify-between md:items-center py-2 border-b">
                <span className="font-bold text-sm md:text-base mb-2 md:mb-0">{project.title}</span>
                <button onClick={() => navigate(`/projeto/${project.id}`)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 focus:outline-none md:ml-4">
                  Ver Detalhes
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Feed de atividades recentes */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Atividades Recentes</h2>
        <div className="bg-white p-2 md:p-4 rounded shadow">
          <ul>
            {actions.slice(0, 5).map((action) => (
              <li key={action.id} className="py-2 border-b font-bold text-sm md:text-base">
                {getUserFullName(action.userId)} adicionou uma ação ao projeto {getProjectTitle(action.projectId)}.
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
