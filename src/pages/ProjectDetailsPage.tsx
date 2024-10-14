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
}

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Extrai o id da URL
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Estado para mensagens de erro

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem('token'); // Obtém o token do armazenamento local

        const response = await fetch(`http://localhost:5168/api/projects/${id}`, {
          method: 'GET', // Método da requisição
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Passa o token no cabeçalho de autorização
          },
        });

        if (!response.ok) {
          throw new Error(`Erro na resposta: ${response.statusText}`);
        }

        const data = await response.json();
        setProject(data.data); // Ajuste conforme necessário, dependendo de como a API retorna os dados
      } catch (error) {
        console.error("Erro ao buscar os detalhes do projeto:", error);
        setError("Não foi possível carregar os detalhes do projeto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]); // Adiciona id como dependência do useEffect

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>; // Exibe mensagem de erro se houver
  }

  if (!project) {
    return <div>Projeto não encontrado.</div>;
  }

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
          <p>{project.status}</p>
        </div>
        <div>
          <strong>Origem:</strong>
          <p>{project.origin}</p>
        </div>
        <div>
          <strong>Data de Origem:</strong>
          <p>{project.originDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
