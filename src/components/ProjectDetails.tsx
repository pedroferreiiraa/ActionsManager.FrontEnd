// src/pages/ProjectDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Obtém o id da URL
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5168/api/projects/${id}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar detalhes do projeto');
        }

        const responseData = await response.json();
        setProject(responseData); // Ajuste conforme a estrutura da resposta
      } catch (error: any) {
        console.error('Erro ao puxar os dados', error);
        setError(error.message);
      }
    };

    fetchProjectDetails();
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      {project ? (
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p>Status: {project.status}</p>
          {/* Adicione mais detalhes do projeto aqui */}
        </div>
      ) : (
        <p>Carregando detalhes do projeto...</p>
      )}
    </div>
  );
};

export default ProjectDetails;
