import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Project {
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
  origin: string;
  originDate: string;
  conclusionText?: string;
}

// Mapeamento dos status
const statusAliases: Record<number, string> = {
  0: 'Criado',
  1: 'Em progresso',
  2: 'Suspenso',
  3: 'Cancelado',
  4: 'Finalizado',
};

const getStatusAlias = (status: number): string => statusAliases[status] || 'Unknown Status';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conclusionText, setConclusionText] = useState('');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Token não encontrado. Faça login novamente.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5168/api/projects/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`Erro na resposta: ${response.statusText}`);

        const data = await response.json();
        setProject(data.data);
      } catch (error) {
        setError('Não foi possível carregar os detalhes do projeto.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const handleStartProject = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5168/api/projects/${id}/start`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: project?.id }),
      });

      if (!response.ok) throw new Error('Erro ao iniciar o projeto.');

      const updatedProject = { ...project, status: 1 };
      setProject(updatedProject);
    } catch (error) {
      setError('Não foi possível iniciar o projeto.');
    }
  };

  const handleFinishProject = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5168/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...project,
          status: 4,
          conclusionText,
        }),
      });

      if (!response.ok) throw new Error('Erro ao finalizar o projeto.');

      const updatedProject = { ...project, status: 4 };
      setProject(updatedProject);
    } catch (error) {
      setError('Não foi possível finalizar o projeto.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!project) return <div>Projeto não encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
      <div className="space-y-4">
        <div>
          <strong>O que:</strong>
          <p>{project.what}</p>
        </div>
        <div>
          <strong>Por que:</strong>
          <p>{project.why}</p>
        </div>
        <div>
          <strong>Quando:</strong>
          <p>{project.when}</p>
        </div>
        <div>
          <strong>Onde:</strong>
          <p>{project.where}</p>
        </div>
        <div>
          <strong>Quem:</strong>
          <p>{project.who}</p>
        </div>
        <div>
          <strong>Como:</strong>
          <p>{project.how}</p>
        </div>
        <div>
          <strong>Quanto:</strong>
          <p>${project.howMuch}</p>
        </div>
        <div>
          <strong>Status:</strong>
          <p>{getStatusAlias(project.status)}</p>
        </div>
        <div>
          <strong>Origem:</strong>
          <p>{project.origin}</p>
        </div>
        <div>
          <strong>Data de Origem:</strong>
          <p>{project.originDate}</p>
        </div>

        {project.status === 0 && (
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleStartProject}
          >
            Iniciar Projeto
          </button>
        )}

        {project.status === 1 && (
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleFinishProject}
          >
            Finalizar Projeto
          </button>
        )}

        {project.status === 4 && (
          <div className="mt-4">
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Digite o texto de conclusão..."
              value={conclusionText}
              onChange={(e) => setConclusionText(e.target.value)}
              disabled={project.status !== 4}
            />
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleFinishProject}
              disabled={!conclusionText}
            >
              Salvar Conclusão
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
