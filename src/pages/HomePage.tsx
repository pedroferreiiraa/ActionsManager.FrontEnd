import { useEffect, useState } from 'react';
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
  title: string; // Adicionado para descrever a ação
}

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch {
    console.error('Invalid token');
    return null;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      const decoded = decodeJWT(token);
      setUserId(decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null);
    }

    // Função para buscar todas as páginas de projetos
    const fetchAllProjects = async () => {
      let allProjects: Project[] = [];
      let pageNumber = 1;
      let totalPages = 1;

      while (pageNumber <= totalPages) {
        try {
          const response = await fetch(`http://192.168.16.194:5002/api/projects?pageNumber=${pageNumber}&pageSize=10`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data?.data && Array.isArray(data.data)) {
            allProjects = [...allProjects, ...data.data.filter((project: Project) => !project.isDeleted)];
            totalPages = data.totalPages;
            pageNumber++;
          } else {
            console.error('Unexpected data format:', data);
            break;
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
          break;
        }
      }

      setProjects(allProjects);
    };

    // Buscar todos os projetos
    fetchAllProjects();

    // Buscar ações
    fetch('http://192.168.16.194:5002/api/actions', {
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
          setActions(data.data.reverse());
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching actions:', error);
      });

    // Buscar usuários
    fetch('http://192.168.16.194:5002/api/users', {
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

  const getUserFullName = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.fullName : 'Usuário Desconhecido';
  };

  // Filtrar projetos concluídos
  const completedProjectsCount = projects.filter((project) => project.status === 4).length;

  // Filtrar projetos em andamento (status diferente de "Concluído" (4))
  const ongoingProjectsCount = projects.filter((project) => project.status !== 4).length;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Boas-vindas e atalhos */}
      <div className="mb-6">
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-6">
          <button
            onClick={() => navigate('/adicionar-projeto')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all md:px-6"
          >
            Adicionar Projeto
          </button>
          <button
            onClick={() => navigate('/listar-projetos')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all md:px-6"
          >
            Listar Projetos
          </button>
        </div>
      </div>
  
      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
          <FaProjectDiagram className="text-4xl text-blue-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">{ongoingProjectsCount}</h2>
            <p className="text-base text-gray-600">Projetos em andamento</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
          <FaCheckCircle className="text-4xl text-green-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">{completedProjectsCount}</h2>
            <p className="text-base text-gray-600">Projetos Concluídos</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
          <FaChartBar className="text-4xl text-blue-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">{actions.length}</h2>
            <p className="text-base text-gray-600">Ações realizadas</p>
          </div>
        </div>
      </div>
  
      {/* Últimos projetos adicionados */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Últimos Projetos Adicionados</h2>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <ul>
            {projects.slice(0, 5).map((project) => (
              <li
                key={project.id}
                className="flex flex-col md:flex-row md:justify-between md:items-center py-3 border-b last:border-none"
              >
                <span className="font-semibold text-base">{project.title}</span>
                <button
                  onClick={() => navigate(`/projeto/${project.id}`)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all md:ml-4"
                >
                  Ver Detalhes
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
  
      {/* Feed de atividades recentes */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Atividades Recentes</h2>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <ul>
            {actions.slice(0, 5).map((action) => (
              <li key={action.id} className="py-3 border-b last:border-none font-medium text-base text-gray-700">
                {getUserFullName(action.userId)} inseriu a seguinte ação: {action.title}.
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
