import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Department {
  id: number;
  name: string;
  liderId: number;
  gestorId: number;
  users: User[];
}

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isDeleted: boolean;
  departmentId: number;
}

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    console.error("Invalid token");
    return null;
  }
};

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [expandedUsers, setExpandedUsers] = useState<Record<number, boolean>>({}); // Estado do accordion
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token não encontrado.");
        }

        // Decodifica o token para obter o ID do usuário atual
        const decoded = decodeJWT(token);
        const userId = decoded?.[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

        if (!userId) {
          throw new Error("ID do usuário não encontrado no token.");
        }

        // Faz a requisição para buscar todos os departamentos
        const response = await fetch(
          `http://192.168.16.240:5002/api/departments`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar departamentos.");
        }

        const data = await response.json();

        // Filtra os departamentos onde o gestorId corresponde ao ID do usuário logado
        const filteredDepartments = data.data.filter(
          (department: Department) => department.gestorId === parseInt(userId)
        );

        setDepartments(filteredDepartments);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Ocorreu um erro desconhecido.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Função para alternar o accordion de usuários
  const toggleUsers = (departmentId: number) => {
    setExpandedUsers((prevState) => ({
      ...prevState,
      [departmentId]: !prevState[departmentId],
    }));
  };

  // Função para redirecionar para a página de projetos do departamento
  const handleViewProjects = (departmentId: number) => {
    navigate(`/listar-projetos-setor/${departmentId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">Departamentos Gerenciados</h1>
      {departments.length === 0 ? (
        <div className="text-gray-500 text-center">Nenhum departamento encontrado.</div>
      ) : (
        <div className="space-y-4">
          {departments.map((department) => (
            <div
              key={department.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">
                  {department.name}
                </h2>
                <button
                  onClick={() => handleViewProjects(department.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ver Projetos
                </button>
              </div>
              <div className="text-gray-600 mb-4">
                <p>
                  <strong>Líder:</strong>{" "}
                  {
                    department.users.find((user) => user.id === department.liderId)
                      ?.fullName
                  }
                </p>
                <p>
                  <strong>Gestor:</strong>{" "}
                  {
                    department.users.find((user) => user.id === department.gestorId)
                      ?.fullName
                  }
                </p>
              </div>
              <div>
                <button
                  onClick={() => toggleUsers(department.id)}
                  className="flex justify-between items-center w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                >
                  <h3 className="text-lg font-medium text-gray-700">Colaboradores</h3>
                  <span className="text-gray-500">
                    {expandedUsers[department.id] ? "▲" : "▼"}
                  </span>
                </button>
                {expandedUsers[department.id] && (
                  <ul className="mt-4 space-y-2">
                    {department.users
                      .filter((user) => !user.isDeleted)
                      .map((user) => (
                        <li
                          key={user.id}
                          className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                        >
                          <span className="text-gray-700">{user.fullName}</span>
                          <span
                            className={`px-2 py-1 text-sm rounded-full ${
                              user.role === "Lider"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "Gestor"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;