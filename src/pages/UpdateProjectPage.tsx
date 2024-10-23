import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

interface Project {
  id: number; // Atualizado para refletir o tipo correto esperado pela API
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

const UpdateProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [originDate, setOriginDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [originNumber, setOriginNumber] = useState<number>(0);

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

        if (!id || id === 'undefined') {
          throw new Error('ID do projeto inválido.');
        }

        const projectId = parseInt(id, 10);
        if (isNaN(projectId)) {
          throw new Error('ID do projeto deve ser um número válido.');
        }

        const projectUrl = `http://localhost:5000/api/projects/${projectId}`;
        console.log('Fetching project details from:', projectUrl); // Log para depuração

        const projectResponse = await fetch(projectUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!projectResponse.ok) {
          const errorText = await projectResponse.text();
          throw new Error(`Erro ao buscar os detalhes do projeto: ${errorText}`);
        }

        const projectData = await projectResponse.json();
        console.log('Project data fetched:', projectData); // Log para depuração

        if (projectData) {
          setProject(projectData);
          setTitle(projectData.title);
          setOriginDate(projectData.originDate);
          setDescription(projectData.description);
          setOrigin(projectData.origin);
          setOriginNumber(projectData.originNumber);
        } else {
          throw new Error('Projeto não encontrado.');
        }
      } catch (error: any) {
        console.error('Erro ao buscar os detalhes do projeto:', error); // Log para depuração
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjectDetails();
    }
  }, [id, token]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (project) {
      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }

        const updateUrl = `http://localhost:5000/api/projects/${project.id}`;
        const updatedProject = {
          id: project.id, // Atualizado para garantir que seja enviado como número, conforme a API espera
          title: title,
          originDate: originDate,
          description: description,
          origin: origin,
          originNumber: originNumber,
        };

        console.log('Updating project with data:', updatedProject); // Log para depuração

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

        console.log('Projeto atualizado com sucesso'); // Log para depuração

        // Navega de volta à página de detalhes após a atualização
        navigate(`/projeto/${project.id}`);
      } catch (error: any) {
        console.error('Erro ao atualizar o projeto:', error); // Log para depuração
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
        <form onSubmit={handleUpdateProject} className="bg-white p-6 rounded shadow">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-bold mb-2">
              Título do Projeto
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="originDate" className="block text-sm font-bold mb-2">
              Data de Origem
            </label>
            <input
              type="text"
              id="originDate"
              value={originDate}
              onChange={(e) => setOriginDate(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-bold mb-2">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="origin" className="block text-sm font-bold mb-2">
              Origem
            </label>
            <input
              type="text"
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="originNumber" className="block text-sm font-bold mb-2">
              Número de Origem
            </label>
            <input
              type="number"
              id="originNumber"
              value={originNumber}
              onChange={(e) => setOriginNumber(parseInt(e.target.value, 10))}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
          >
            Atualizar Projeto
          </button>
        </form>
      ) : (
        <div className="text-gray-500">Projeto não encontrado.</div>
      )}
    </div>
  );
};

export default UpdateProjectPage;
