import React, { useState } from 'react';
import 'tailwindcss/tailwind.css';
import { useNavigate, useParams } from 'react-router-dom';

interface ActionForm {
  title: string;
  what: string;
  why: string;
  when: string;
  where: string;
  who: string;
  how: string;
  howMuch: number;
  origin: string;
  originDate: string;
  status: number;
  conclusionText: string;
}

const AddAction: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>(); // Obtemos o ID do projeto da URL
  const [formData, setFormData] = useState<ActionForm>({
    title: '',
    what: '',
    why: '',
    when: '',
    where: '',
    who: '',
    how: '',
    howMuch: 0,
    origin: '',
    originDate: '',
    status: 0,
    conclusionText: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Função para lidar com a mudança nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt');

    try {
      // Primeiro passo: criar a ação
      const createActionResponse = await fetch('http://localhost:5000/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          userId: 1, // Pegando o ID do usuário; isso pode ser dinâmico de acordo com seu sistema de autenticação
        }),
      });

      if (!createActionResponse.ok) {
        const errorData = await createActionResponse.json();
        throw new Error(`Erro ao adicionar ação: ${errorData.message || 'Erro desconhecido.'}`);
      }

      // Extraindo o ID da ação recém-criada
      const createdAction = await createActionResponse.json();
      const actionId = createdAction.id;

      // Segundo passo: associar a ação ao projeto
      const associateActionResponse = await fetch(`http://localhost:5000/api/projects/${projectId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: parseInt(projectId!), // ID do projeto vindo da URL
          actionId: actionId, // ID da ação recém-criada
        }),
      });

      if (!associateActionResponse.ok) {
        const errorData = await associateActionResponse.json();
        throw new Error(`Erro ao associar ação ao projeto: ${errorData.message || 'Erro desconhecido.'}`);
      }

      // Se a ação for adicionada e associada com sucesso, redirecionar para a página do projeto
      navigate(`/projeto/${projectId}`);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Adicionar Ação ao Projeto</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-bold mb-2">Título da Ação</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="what" className="block text-sm font-bold mb-2">O que</label>
          <textarea
            id="what"
            name="what"
            value={formData.what}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="why" className="block text-sm font-bold mb-2">Por quê</label>
          <textarea
            id="why"
            name="why"
            value={formData.why}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="when" className="block text-sm font-bold mb-2">Quando</label>
          <input
            type="text"
            id="when"
            name="when"
            value={formData.when}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="where" className="block text-sm font-bold mb-2">Onde</label>
          <input
            type="text"
            id="where"
            name="where"
            value={formData.where}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="who" className="block text-sm font-bold mb-2">Quem</label>
          <input
            type="text"
            id="who"
            name="who"
            value={formData.who}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="how" className="block text-sm font-bold mb-2">Como</label>
          <textarea
            id="how"
            name="how"
            value={formData.how}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="howMuch" className="block text-sm font-bold mb-2">Quanto</label>
          <input
            type="number"
            id="howMuch"
            name="howMuch"
            value={formData.howMuch}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="origin" className="block text-sm font-bold mb-2">Origem</label>
          <input
            type="text"
            id="origin"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="originDate" className="block text-sm font-bold mb-2">Data de Origem</label>
          <input
            type="text"
            id="originDate"
            name="originDate"
            value={formData.originDate}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="conclusionText" className="block text-sm font-bold mb-2">Texto de Conclusão</label>
          <textarea
            id="conclusionText"
            name="conclusionText"
            value={formData.conclusionText}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
        >
          Adicionar Ação
        </button>
      </form>
    </div>
  );
};

export default AddAction;
