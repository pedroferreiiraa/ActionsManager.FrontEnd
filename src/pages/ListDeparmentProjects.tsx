import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

interface Project {
  id: number;
  title: string;
  projectNumber: number;
  status: number;
  originDate: string;
  isDeleted: boolean;  
  createdAt: string;
}

interface User {
  id: number;
  departmentId: number;
}

interface Department {
  id: number;
  name: string;
}

interface DecodedToken {
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  exp: number;
}

const DepartmentProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<number>(-1); // -1 significa "Todos"
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token não encontrado.");
        }
  
        const decoded: DecodedToken = jwtDecode(token);
        const leaderId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  
        if (!leaderId) {
          throw new Error("Leader ID não encontrado no token.");
        }
  
        // Fetch informações do usuário para obter o ID do departamento
        const userResponse = await axios.get(`http://192.168.16.194:5002/api/users/${leaderId}`);
        const userData: User = userResponse.data;
        const departmentId = userData.departmentId;
  
        if (!departmentId) {
          throw new Error("Departamento não encontrado para o usuário.");
        }
  
        // Fetch nome do departamento
        const departmentResponse = await axios.get(`http://192.168.16.194:5002/api/departments/${departmentId}`);
        const departmentData: Department = departmentResponse.data;
        setDepartmentName(departmentData.name || "Departamento não identificado");
  
        // Fetch projetos do departamento com paginação
        const projectsResponse = await axios.get(
          `http://192.168.16.194:5002/api/projects/departments/${departmentId}`,
          {
            params: {
              search: searchTerm,
              pageNumber,
              pageSize: 10,
              status: statusFilter, 
            },
          }
        );
  
        const { data, totalPages } = projectsResponse.data;
        setProjects(data || []);
        setTotalPages(totalPages || 1);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserAndProjects();
  }, [searchTerm, pageNumber, statusFilter]);

  const getStatusColor = (status: number) => {
    switch (status) {
        case 0:
            return "bg-blue-500 text-white";  // Criado - Azul
        case 1:
            return "bg-yellow-500 text-white"; // Em Andamento - Amarelo
        case 2:
            return "bg-gray-500 text-white";   // Suspenso - Cinza
        case 3:
            return "bg-red-500 text-white";    // Cancelado - Vermelho
        case 4:
            return "bg-green-500 text-white";  // Concluído - Verde
        default:
            return "bg-gray-300 text-black";   // Padrão para "Todos" ou indefinido - Cinza claro
    }
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
  
  const handleProjectClick = (projectId: number) => {
    navigate(`/projeto/${projectId}`);
  };

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

  if (loading) {
    return <div className="text-center text-gray-500">Carregando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
          <button
          onClick={() => navigate("/home")}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all"
          >
          Voltar
          </button>  

          {departmentName && (
            <h1 className="text-center text-gray-600 mb-4">
              Projetos do departamento: {departmentName}
            </h1>
          )}

          <form onSubmit={handleSearch} className="flex items-center mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Buscar projetos..."
          />
          <button
            type="submit"
            className="ml-3 p-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all"
          >
            <FaSearch />
          </button>
        </form>
      
        <div className="mb-6">
          <label htmlFor="statusFilter" className="block text-sm font-semibold text-gray-700 mb-3">
            Filtrar por Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value={-1}>Todos</option>
            <option value={0}>Criado</option>
            <option value={1}>Em Andamento</option>
            <option value={4}>Concluído</option>
          </select>
        </div>

    
    
        {loading ? (
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
          </div>
        ) : error ? ( 
          <div className="text-red-500 text-center mb-6">{error}</div>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum projeto encontrado.</p>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => (
              <li key={project.id} className="py-4 border-b last:border-b-0">
                <div className="md:flex md:justify-between md:items-center">
                  <div className="flex items-center">
                    <span className="font-semibold text-lg text-gray-800">{project.title}</span>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-lg ml-3 ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/projeto/${project.id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all mt-3 md:mt-0 md:ml-4"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

      
      {/* Paginação */}
      <div className="flex justify-between items-center mt-6">
              <button
                onClick={handlePreviousPage}
                disabled={pageNumber === 1}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow disabled:opacity-50 focus:outline-none hover:bg-gray-400 transition-all"
              >
                Página Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {pageNumber} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pageNumber === totalPages}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow disabled:opacity-50 focus:outline-none hover:bg-gray-400 transition-all"
              >
                Próxima Página
              </button>
            </div>
    </div>
  );
};

export default DepartmentProjects;
