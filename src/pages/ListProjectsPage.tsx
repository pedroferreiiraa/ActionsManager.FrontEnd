import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import { FaSearch } from 'react-icons/fa';

interface Project {
    id: string;
    title: string;
    projectNumber: number;
    status: number;
    originDate: string;
}

const ListProjects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<number>(-1); // -1 significa "Todos"
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError('');

                const url = `http://localhost:5168/api/projects?search=${searchTerm}&pageNumber=${pageNumber}&pageSize=10&status=${statusFilter}`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar os projetos.');
                }

                const data = await response.json();
                if (data.data.length === 0) {
                    setError('Nenhum projeto encontrado para o filtro selecionado.');
                }
                setProjects(data.data || []);
                setTotalPages(data.totalPages || 1);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [searchTerm, pageNumber, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPageNumber(1);
    };

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const handleNextPage = () => {
        if (pageNumber < totalPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(parseInt(e.target.value));
        setPageNumber(1);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-start mb-4">
                <button
                    onClick={() => navigate("/adicionar-projeto")}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                >
                    Adicionar Projeto
                </button>
            </div>
            <form onSubmit={handleSearch} className="flex items-center mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Buscar projetos..."
                />
                <button
                    type="submit"
                    className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                >
                    <FaSearch />
                </button>
            </form>

            <div className="mb-6">
                <label htmlFor="statusFilter" className="block text-sm font-bold mb-2">
                    Filtrar por Status
                </label>
                <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={-1}>Todos</option>
                    <option value={0}>Criado</option>
                    <option value={1}>Em Andamento</option>
                    <option value={2}>Suspenso</option>
                    <option value={3}>Cancelado</option>
                    <option value={4}>Concluído</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 mb-4">{error}</div>
            ) : (
                <div className="bg-white p-4 rounded shadow">
                    <ul>
                        {projects.length === 0 ? (
                            <li className="text-gray-500">Nenhum projeto encontrado.</li>
                        ) : (
                            projects.map((project) => (
                                <li
                                    key={project.id}
                                    className="py-2 border-b last:border-b-0"
                                >
                                    <div className="md:flex md:justify-between md:items-center">
                                        <div>
                                            <span className="font-bold">{project.title}</span> (#{project.projectNumber}) - Status: {getStatusText(project.status)}
                                        </div>
                                        <button
                                            onClick={() => navigate(`/projeto/${project.id}`)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none mt-2 md:mt-0 md:ml-4"
                                        >
                                            Ver Detalhes
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>

                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={handlePreviousPage}
                            disabled={pageNumber === 1}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50 focus:outline-none hover:bg-gray-400"
                        >
                            Página Anterior
                        </button>
                        <span className="text-sm">
                            Página {pageNumber} de {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={pageNumber === totalPages}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50 focus:outline-none hover:bg-gray-400"
                        >
                            Próxima Página
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const getStatusText = (status: number): string => {
    switch (status) {
        case 0:
            return 'Criado';
        case 1:
            return 'Em Andamento';
        case 2:
            return 'Suspenso';
        case 3:
            return 'Cancelado';
        case 4:
            return 'Concluído';
        default:
            return 'Desconhecido';
    }
};

export default ListProjects;
