import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Token inválido');
    return null;
  }
};

const getUserIdFromToken = (token: string): number | null => {
  const decoded = decodeJWT(token);
  if (decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) {
    return parseInt(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
  }
  return null;
};

const AddActionForm: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>('');
  const [, setUserId] = useState<number | null>(null);
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
    userId: 0
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const userIdFromToken = getUserIdFromToken(storedToken);
      if (userIdFromToken) {
        setUserId(userIdFromToken);
        setFormData((prevData) => ({
          ...prevData,
          userId: userIdFromToken,
        }));
      }
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

      const createActionResponse = await fetch('http://192.168.16.194:5002/api/actions', {
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

      const associateUrl = `http://192.168.16.194:5002/api/projects/${projectId}/actions`;
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

      navigate(-1)
    } catch (error: any) {
      setError(error.message);
    }
  };


  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
       <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 px-5 py-3 rounded-lg mb-4 hover:bg-gray-300 focus:outline-none shadow-md transition-all"
          >
            Voltar
          </button>
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