import React, { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaProjectDiagram, FaUsers } from 'react-icons/fa';

interface Project {
  id: string;
  title: string;
}

interface User {
  id: string;
  userName: string;
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
  const [users, setUsers] = useState<User[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      const decoded = decodeJWT(token);
      setUserId(decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null);
    }

    fetch('http://localhost:5168/api/projects', {
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
        if (data?.isSuccess && Array.isArray(data.data)) {
          setProjects(data.data);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });

    fetch('http://localhost:5168/api/users', {
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
        if (data?.isSuccess && Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });

    fetch('http://localhost:5168/api/actions', {
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
        if (data?.isSuccess && Array.isArray(data.data)) {
          setActions(data.data);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching actions:', error);
      });
  }, []);

  const getUserFullName = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.fullName : 'Usuário Desconhecido';
  };

  const getProjectTitle = (projectId: string) => {
    const project = projects.find((project) => project.id === projectId);
    return project ? project.title : 'Projeto Desconhecido';
  };

  const addProject = () => {
    if (!userId) return;

    const projectData = {
      title: 'Novo Projeto',
      userId,
    };

    fetch('http://localhost:5168/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
      body: JSON.stringify(projectData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Project added:', data);
        setProjects((prevProjects) => [...prevProjects, data]);
      })
      .catch((error) => {
        console.error('Error adding project:', error);
      });
  };

  return (
    <div className="p-6">
      {/* Boas-vindas e atalhos */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Sistema de Gestão de Ações!</h1>
        <p className="text-gray-600">Aqui estão algumas informações rápidas e atalhos úteis para você começar.</p>
        <div className="flex space-x-4 mt-4">
          <button onClick={addProject} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none">
            Adicionar Projeto
          </button>
          <button onClick={() => navigate('/listar-projetos')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none">
            Listar Projetos
          </button>
          <button onClick={() => navigate('/adicionar-usuarios')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none">
            Adicionar Usuário
          </button>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-100 p-4 rounded flex items-center">
          <FaProjectDiagram className="text-4xl text-blue-500 mr-4" />
          <div>
            <h2 className="text-xl font-bold">{projects.length}</h2>
            <p className="font-bold">Projetos em andamento</p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded flex items-center">
          <FaUsers className="text-4xl text-blue-500 mr-4" />
          <div>
            <h2 className="text-xl font-bold">{users.length}</h2>
            <p className="font-bold">Usuários ativos</p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded flex items-center">
          <FaChartBar className="text-4xl text-blue-500 mr-4" />
          <div>
            <h2 className="text-xl font-bold">{actions.length}</h2>
            <p className="font-bold">Ações realizadas</p>
          </div>
        </div>
      </div>

      {/* Últimos projetos adicionados */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Últimos Projetos Adicionados</h2>
        <div className="bg-white p-4 rounded shadow">
          <ul>
            {projects.slice(0, 3).map((project) => (
              <li key={project.id} className="flex justify-between items-center py-2 border-b">
                <span className="font-bold">{project.title}</span>
                <button onClick={() => navigate(`/projeto/${project.id}`)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none">
                  Ver Detalhes
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Feed de atividades recentes */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Atividades Recentes</h2>
        <div className="bg-white p-4 rounded shadow">
          <ul>
            {actions.map((action) => (
              <li key={action.id} className="py-2 border-b font-bold">
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

// App.js (exemplo de uso)
// import Home from './components/Home';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// function App() {
//   return (
//     <Router>
//       <div>
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<Home />} />
{/* Outras rotas */ }
//         </Routes>
//       </div>
//     </Router>
//   );
// }
// export default App;
