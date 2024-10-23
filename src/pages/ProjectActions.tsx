import React, { useEffect, useState } from 'react';

interface Action {
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
  conclusionText: string;
}

interface ProjectActionsProps {
  projectId: string;
  actionIds: number[];
  token: string;
}

export const ProjectActions: React.FC<ProjectActionsProps> = ({ projectId, actionIds, token }) => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        const fetchedActions: Action[] = [];
        for (const actionId of actionIds) {
          const response = await fetch(`http://localhost:5000/api/actions/${actionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          fetchedActions.push(data.data);
        }
        setActions(fetchedActions);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (actionIds.length > 0 && token) {
      fetchActions();
    }
  }, [actionIds, token]);

  const handleStartAction = async (actionId: number) => {
    try {
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }

      const url = `http://localhost:5000/api/actions/${actionId}/start`;

      const body = {
        id: actionId, // Inclui o ID da ação
        command: "StartAction" // Comando necessário pelo backend
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body) // Corpo da requisição
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao iniciar a ação: ${errorMessage}`);
      }

      // Atualiza o status da ação localmente
      setActions((prevActions) =>
        prevActions.map((action) =>
          action.id === actionId
            ? { ...action, status: 1, startedAt: new Date().toISOString() }
            : action
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCompleteAction = async (actionId: number) => {
    try {
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }

      const url = `http://localhost:5000/api/actions/${actionId}/complete`;

      const body = {
        id: actionId, // Inclui o ID da ação
        command: "CompleteAction" // Comando necessário pelo backend
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body) // Corpo da requisição
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao completar a ação: ${errorMessage}`);
      }

      // Atualiza o status da ação localmente
      setActions((prevActions) =>
        prevActions.map((action) =>
          action.id === actionId
            ? { ...action, status: 4, completedAt: new Date().toISOString() }
            : action
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };
  
    const handleDeleteAction = async (actionId: number) => {
    try {
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }
  
      const url = `http://localhost:5000/api/actions/${actionId}/delete`;
  
      const body = {
        id: actionId
      };
  
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body) // Incluindo o corpo da requisição como esperado
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao deletar a ação: ${errorMessage}`);
      }
  
      // Atualiza o estado local removendo a ação deletada
      setActions((prevActions) =>
        prevActions.filter((action) => action.id !== actionId)
      );
  
      // Atualiza os actionIds no projeto
      if (project) {
        setProject({
          ...project,
          actionIds: project.actionIds.filter((id) => id !== actionId),
        });
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) return <div>Carregando ações...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="actions-list">
      {actions.map((action) => (
        <div key={action.id}>
          <h3>{action.title}</h3>
          <p>{action.what}</p>
          <button onClick={() => handleStartAction(action.id)}>Iniciar Ação</button>
          <button onClick={() => handleCompleteAction(action.id)}>Completar Ação</button>
          <button onClick={() => handleDeleteAction(action.id)}>Deletar Ação</button>
        </div>
      ))}
    </div>
  );
};
