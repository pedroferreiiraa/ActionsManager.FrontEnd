import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import { useNavigate } from 'react-router-dom';

const decodeJWT = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        console.error('Invalid token');
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

const AddProject = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
 
    const [originDate, setOriginDate] = useState('');
    const [origin, setOrigin] = useState('');
    const [originNumber, setOriginNumber] = useState<number | ''>('');
    const [error, setError] = useState<{ [key: string]: string }>({});
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            const userIdFromToken = getUserIdFromToken(storedToken);
            if (userIdFromToken) {
                setUserId(userIdFromToken);
            }
        }
    }, []);

    const handleAddProject = () => {
        const newError: { [key: string]: string } = {};

        if (!title) {
            newError.title = 'O título do projeto é obrigatório.';
        }
        
        if (!originDate) {
            newError.originDate = 'A data de origem é obrigatória.';
        }
        if (!origin) {
            newError.origin = 'A origem é obrigatória.';
        }
        if (!originNumber) {
            newError.originNumber = 'O número de origem é obrigatório.';
        }
        if (!token) {
            newError.token = 'Token não encontrado. Faça login novamente.';
        }
        if (!userId) {
            newError.userId = 'Usuário não identificado. Faça login novamente.';
        }

        if (Object.keys(newError).length > 0) {
            setError(newError);
            return;
        }

        const projectData = {
            title,
            userId,
            status: 0,
            originDate,
            description,
            origin,
            originNumber,
        };

        console.log('Attempting to add project with the following data:', projectData);

        fetch('http://localhost:5000/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(projectData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log('Project added:', data);
                navigate('/listar-projetos');
            })
            .catch((error) => {
                console.error('Error adding project:', error);
                setError({ general: 'Erro ao adicionar o projeto. Tente novamente mais tarde.' });
            });
    };

    return (
        <div className="p-6 md:p-8 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
  <h2 className="text-2xl font-semibold mb-6 text-gray-800">Adicionar Novo Projeto</h2>
  
  <div className="mb-5">
    <label className="block text-sm font-semibold mb-2 text-gray-700" htmlFor="origin">
      Origem
    </label>
    <input
      id="origin"
      type="text"
      value={origin}
      onChange={(e) => setOrigin(e.target.value)}
      className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    />
    {error.origin && <div className="text-red-500 mt-1">{error.origin}</div>}
  </div>

  <div className="mb-5">
    <label className="block text-sm font-semibold mb-2 text-gray-700" htmlFor="originNumber">
      Número de Origem
    </label>
    <input
      id="originNumber"
      type="number"
      value={originNumber}
      onChange={(e) => setOriginNumber(isNaN(parseInt(e.target.value)) ? '' : parseInt(e.target.value))}
      className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    />
    {error.originNumber && <div className="text-red-500 mt-1">{error.originNumber}</div>}
  </div>

  <div className="mb-5">
    <label className="block text-sm font-semibold mb-2 text-gray-700" htmlFor="originDate">
      Data de Origem
    </label>
    <input
      id="originDate"
      type="text"
      value={originDate}
      onChange={(e) => setOriginDate(e.target.value)}
      className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    />
    {error.originDate && <div className="text-red-500 mt-1">{error.originDate}</div>}
  </div>

  <div className="mb-5">
    <label className="block text-sm font-semibold mb-2 text-gray-700" htmlFor="title">
      Título do Projeto
    </label>
    <input
      id="title"
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    />
    {error.title && <div className="text-red-500 mt-1">{error.title}</div>}
  </div>

  <div className="mb-5">
    <label className="block text-sm font-semibold mb-2 text-gray-700" htmlFor="description">
      Descrição do Projeto
    </label>
    <textarea
      id="description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="w-full h-36 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    ></textarea>
  </div>

  <button
    onClick={handleAddProject}
    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
  >
    Adicionar Projeto
  </button>

  {error.general && <div className="text-red-500 mt-4">{error.general}</div>}
</div>

    );
};

export default AddProject;