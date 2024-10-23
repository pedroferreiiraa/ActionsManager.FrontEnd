import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

const AddActionForm: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    what: '',
    why: '',
    when: '',
    where: '',
    who: '',
    how: '',
    howMuch: 0,
    origin: '',
    originDate: new Date().toISOString(),
    status: 0,
    conclusionText: '',
    userId: 1, // Este valor será atualizado com base no usuário logado
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        throw new Error('Token de autorização não encontrado.');
      }

      // Cria a ação
      const createActionResponse = await fetch('http://localhost:5000/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, projectId: Number(projectId) }),
      });

      if (!createActionResponse.ok) {
        const errorMessage = await createActionResponse.text();
        throw new Error(`Erro ao criar a ação: ${errorMessage}`);
      }

      const createdAction = await createActionResponse.json();

      // Vincula a ação ao projeto
      const associateUrl = `http://localhost:5000/api/projects/${projectId}/actions`;
      const associateResponse = await fetch(associateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: Number(projectId),
          actionId: createdAction.id,
        }),
      });

      if (!associateResponse.ok) {
        const errorMessage = await associateResponse.text();
        throw new Error(`Erro ao associar a ação ao projeto: ${errorMessage}`);
      }

      // Redireciona de volta para os detalhes do projeto
      navigate(`/projeto/${projectId}`);
    } catch (error: any) {
      setError(error.message);
    }
  };
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
  <h1 className="text-2xl font-semibold mb-6 text-gray-800">Adicionar Ação ao Projeto</h1>

  {error && <div className="text-red-500 mb-6">{error}</div>}

  <form onSubmit={handleSubmit}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Título da Ação</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
      <div>
        <label htmlFor="when" className="block text-sm font-semibold text-gray-700 mb-2">Quando</label>
        <input
          type="text"
          id="when"
          name="when"
          value={formData.when}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label htmlFor="where" className="block text-sm font-semibold text-gray-700 mb-2">Onde</label>
        <input
          type="text"
          id="where"
          name="where"
          value={formData.where}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
      <div>
        <label htmlFor="who" className="block text-sm font-semibold text-gray-700 mb-2">Quem</label>
        <input
          type="text"
          id="who"
          name="who"
          value={formData.who}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label htmlFor="howMuch" className="block text-sm font-semibold text-gray-700 mb-2">Quanto</label>
        <input
          type="number"
          id="howMuch"
          name="howMuch"
          value={formData.howMuch}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="col-span-2">
        <label htmlFor="what" className="block text-sm font-semibold text-gray-700 mb-2">O que</label>
        <textarea
          id="what"
          name="what"
          value={formData.what}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="col-span-2">
        <label htmlFor="why" className="block text-sm font-semibold text-gray-700 mb-2">Por quê</label>
        <textarea
          id="why"
          name="why"
          value={formData.why}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="col-span-2">
        <label htmlFor="how" className="block text-sm font-semibold text-gray-700 mb-2">Como</label>
        <textarea
          id="how"
          name="how"
          value={formData.how}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
    </div>

   

    <button
      type="submit"
      className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all"
    >
      Adicionar Ação
    </button>
  </form>
</div>

  );
};

export default AddActionForm;