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
    const [projectNumber, setProjectNumber] = useState(0);
    const [originDate, setOriginDate] = useState('');
    const [error, setError] = useState('');
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
        if (!title) {
            setError('O título do projeto é obrigatório.');
            return;
        }

        if (!token) {
            setError('Token não encontrado. Faça login novamente.');
            return;
        }

        if (!userId) {
            setError('Usuário não identificado. Faça login novamente.');
            return;
        }

        const projectData = {
            title,
            projectNumber,
            description,
            userId,
            status: 0,
            originDate: originDate || new Date().toISOString(),
        };

        console.log('Attempting to add project with the following data:', projectData);

        fetch('http://localhost:5168/api/projects', {
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
                setError('Erro ao adicionar o projeto. Tente novamente mais tarde.');
            });
    };

    return (
        <div className="p-4 md:p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Adicionar Novo Projeto</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="title">
                    Título do Projeto
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="description">
                    Descrição do Projeto (opcional)
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="projectNumber">
                    Número do Projeto
                </label>
                <input
                    id="projectNumber"
                    type="number"
                    value={projectNumber}
                    onChange={(e) => setProjectNumber(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="originDate">
                    Data de Origem (opcional)
                </label>
                <input
                    id="originDate"
                    type="text"
                    value={originDate}
                    onChange={(e) => setOriginDate(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button
                onClick={handleAddProject}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
            >
                Adicionar Projeto
            </button>
        </div>
    );
};

export default AddProject;
