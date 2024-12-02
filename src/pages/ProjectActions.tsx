import React, { useEffect, useState } from 'react';


interface Action {
  id: number;
  title: string;
  description: string;
  status: number;
  projectId: number;
  UserId: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  what: string;
  why: string;
  when: string;
  where: string;
  who: string;
  howMuch: string;
  conclusionText: string;
  actionId: number;
}

interface ProjectActionsProps {
  projectId: number;
  token: string;
}


const getActionStatusText = (status: number): string => {
  const statusMap: { [key: number]: string } = {
    0: 'Não Iniciada',
    1: 'Em Andamento',
    2: 'Pendente',
    3: 'Atrasada',
    4: 'Concluída'
  };
  return statusMap[status] || 'Status Desconhecido';
};

const ProjectActions: React.FC<ProjectActionsProps> = ({ projectId, token }) => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [conclusionText, setConclusionText] = useState<string>('');

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError('');

      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }

      const actionUrl = `http://192.168.16.194:5002/api/actions/`;
      const response = await fetch(actionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar as ações do projeto');
      }

      const actionsFromResponse = await response.json();

      if (!Array.isArray(actionsFromResponse.data)) {
        throw new Error('A resposta não contém um array de ações.');
      }

      const projectActions = actionsFromResponse.data.filter((action: Action) => action.projectId === projectId);
      setActions(projectActions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && token) {
      fetchActions();
    }
  }, [projectId, token]);

  const handleActionClick = (action: Action) => {
    setSelectedAction(action);
  };

  const handleCloseModal = () => {
    setSelectedAction(null);
  };

  const handleStartAction = async () => {
    if (selectedAction) {
      try {
        const url = `http://192.168.16.194:5002/api/actions/${selectedAction.id}/start`;

        const body = {
          id: selectedAction.id,
          command: "StartAction",
        };

        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error('Erro ao iniciar a ação');
        }

        const updatedAction = await response.json();

        // Atualiza a lista de ações mantendo a `selectedAction` inalterada
        const newActionsState = actions.map((action) =>
          action.id === updatedAction.id ? { ...action, ...updatedAction } : action
        );

        setActions(newActionsState);

        // Garante que `selectedAction` é atualizado corretamente com os novos dados
        setSelectedAction((prev) => ({
          ...prev,
          ...updatedAction, // Atualiza a `selectedAction` com os novos dados do servidor
          status: 1, // Define o status como "Em Andamento"
          startedAt: new Date().toISOString(), // Atualiza a data de início
        }));
        
        fetchActions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleCompleteAction = async () => {
    if (selectedAction) {
      try {
        if (!token) {
          throw new Error('Token de autorização não encontrado.');
        }

        const url = `http://192.168.16.194:5002/api/actions/${selectedAction.id}/complete`;

        const body = {
          id: selectedAction.id,
          command: "CompleteAction",
          conclusionText: conclusionText,
        };

        const response = await fetch(url, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erro ao completar a ação: ${errorMessage}`);
        }

        const updatedAction = await response.json();

        const newActionsState = actions.map((action) =>
          action.id === updatedAction.id ? { ...action, ...updatedAction } : action
        );

        setActions(newActionsState);

        // Garante que `selectedAction` é atualizado corretamente com os novos dados
        setSelectedAction((prev) => ({
          ...prev,
          ...updatedAction, // Atualiza a `selectedAction` com os novos dados do servidor
          status: 4, // Define o status como "Completo"
          startedAt: new Date().toISOString(), // Atualiza a data de início
        }));

        fetchActions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleSaveConclusionText = async (actionId: number) => {
    if (conclusionText.trim() === '') {
      setError('O texto de conclusão não pode estar vazio.');
      return;
    }

    try {
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }

      const url = `http://192.168.16.194:5002/api/actions/${actionId}/conclusion`;

      const body = {
        actionId: actionId,
        conclusionText: conclusionText,
      };

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao salvar o texto de conclusão: ${errorMessage}`);
      }

      // Atualiza o estado da ação com o texto de conclusão
      const newActionsState = actions.map((action) =>
        action.id === actionId ? { ...action, conclusionText: conclusionText, status: 4 } : action
      );

      setActions(newActionsState);
      setSelectedAction((prev) => (prev ? { ...prev, conclusionText: conclusionText } : null));
      setConclusionText('');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao salvar texto de conclusão:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        Nenhuma ação cadastrada para este projeto.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Ações do Projeto</h2>
      <div className="grid grid-cols-1 gap-4">
        {actions.map((action) => (
          <div
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-blue-600">{action.title}</h3>
                <p className="text-gray-600 mt-1">{action.description}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  action.status === 4
                    ? 'bg-green-100 text-green-800'
                    : action.status === 1
                    ? 'bg-blue-100 text-blue-800'
                    : action.status === 2
                    ? 'bg-yellow-100 text-yellow-800'
                    : action.status === 3
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {getActionStatusText(action.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedAction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{selectedAction.title}</h2>
            <div className="mb-6 space-y-4">
              <p className="text-gray-700"><span className="font-bold">O quê:</span> {selectedAction.what}</p>
              <p className="text-gray-700"><span className="font-bold">Por que:</span> {selectedAction.why}</p>
              <p className="text-gray-700"><span className="font-bold">Quando:</span> {selectedAction.when}</p>
              <p className="text-gray-700"><span className="font-bold">Onde:</span> {selectedAction.where}</p>
              <p className="text-gray-700"><span className="font-bold">Quem:</span> {selectedAction.who}</p>
              <p className="text-gray-700"><span className="font-bold">Quanto:</span> {selectedAction.howMuch}</p>
              {selectedAction.conclusionText && (
                <p className="text-gray-700"><span className="font-bold">Texto de conclusão:</span> {selectedAction.conclusionText}</p>
              )}
              <p className="text-gray-700"><span className="font-bold">Status:</span> {getActionStatusText(selectedAction.status)}</p>
            </div>

            {selectedAction.status === 0 && (
              <button
                onClick={() => {
                  handleStartAction();
                  setSelectedAction((prev) => {
                    if (prev) {
                      return { ...prev, status: 1, startedAt: new Date().toISOString() };
                    }
                    return prev;
                  });
                }}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg mb-4 hover:bg-blue-700 transition"
              >
                Iniciar Ação
              </button>
            )}
            {selectedAction.status === 1 && (
              <button
                onClick={handleCompleteAction}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg mb-4 hover:bg-green-700 transition"
              >
                Completar Ação
              </button>
            )}
            {selectedAction.status === 4 && !selectedAction.conclusionText && (
              <div className="mb-6">
                <textarea
                  value={conclusionText}
                  onChange={(e) => setConclusionText(e.target.value)}
                  placeholder="Digite o texto de conclusão"
                  className="w-full p-4 border border-gray-300 rounded-lg mb-4"
                />
                <button
                  onClick={() => handleSaveConclusionText(selectedAction.id)}
                  className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition"
                >
                  Salvar Texto de Conclusão
                </button>
              </div>
            )}

            <button
              onClick={() => handleCloseModal()}
              className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectActions;
