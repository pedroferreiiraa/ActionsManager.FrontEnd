// src/pages/ProjectListPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  title: string;
  status: number; // Inclua o status se necessário
}

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token'); // Ajuste conforme necessário

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5168/api/projects', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar projetos');
        }
        
        const responseData = await response.json();
        
        // Remover duplicatas, se necessário
        const uniqueProjects = responseData.data.filter((project: Project, index: number, self: Project[]) =>
          index === self.findIndex((p) => p.id === project.id)
        );

        setProjects(uniqueProjects);
    
      } catch (error: any) {
        console.error('Erro ao puxar os dados', error);
        setError(error.message);
      }
    };
  
    fetchProjects();
  }, []); // Chamada apenas uma vez

  const handleDetailsClick = (id: number) => {
    navigate(`/projects/${id}`); // Redireciona para a página de detalhes do projeto
  };

  return (
    <div className="p-4">
      {error && <p className="text-red-500">{error}</p>}
      <h1 className="text-xl font-bold">Lista de Projetos</h1>
      <div className="grid grid-cols-1 gap-4 mt-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="border rounded p-4">
              <h2 className="text-lg font-semibold">{project.title}</h2>
              <p className="text-gray-700">Status: {project.status}</p>
              <button 
                className="mt-2 bg-blue-800 text-white py-1 px-3 rounded hover:bg-blue-700"
                onClick={() => handleDetailsClick(project.id)} // Chamando a função ao clicar
              >
                Detalhes
              </button>
            </div>
          ))
        ) : (
          <p>Nenhum projeto encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectListPage;
