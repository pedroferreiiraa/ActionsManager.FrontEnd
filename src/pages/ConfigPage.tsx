import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isDeleted: boolean;
  departmentId: number;
}

interface Department {
    id: number;
    name: string;
    liderId: number;
    gestorId: number;
    users: User[];
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

const ConfigPage = () => {
  const [, setUsers] = useState<User[]>([]);
  const [groupedUsers, setGroupedUsers] = useState<Record<string, User[]>>({});
  const [expandedDepartments, setExpandedDepartments] = useState<Record<string, boolean>>({}); // Estado do accordion
  const [, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);

  const fetchUsers = () => {
    const token = localStorage.getItem("jwt");
    fetch("http://192.168.16.194:5002/api/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setUsers(data.data);
          groupUsersByDepartment(data.data);
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  useEffect(() => {
    // Simulando a chamada da API
    const fetchData = async () => {
      const response = await fetch('http://192.168.16.194:5002/api/departments'); // Seu endpoint de departamentos
      const data = await response.json();
      setDepartments(data.data);
    };

    fetchData();
  }, []);

  // Criando um mapeamento de departmentId para o nome do departamento
  const departmentNameMap = departments.reduce((map, department) => {
    map[department.id] = department.name;
    return map;
  }, {} as { [key: number]: string });


  const groupUsersByDepartment = (users: User[]) => {
    const grouped = users
      .filter((user) => !user.isDeleted) // Filtra os usuários onde isDeleted não é true
      .reduce((acc: Record<string, User[]>, user) => {
        const key = user.departmentId || "Sem Departamento";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(user);
        return acc;
      }, {});
    setGroupedUsers(grouped);
  };

  const deleteUser = (id: number) => {
    const token = localStorage.getItem("jwt");
  
    fetch(`http://192.168.16.194:5002/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }) // Envia o id no corpo da requisição
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("User deleted successfully");
        fetchUsers();
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  const handleUpdateRedirect = (id: number) => {
    navigate(`/atualizar-usuario/${id}`); // Redireciona para a página de update
  };

  const handleUpdateDepartmentRedirect = (departmentId: number) => {
    navigate(`/atualizar-departamento/${departmentId}`); // Redireciona para a página de update do departamento
  };

  const toggleDepartment = (departmentId: string) => {
    setExpandedDepartments((prevState) => ({
      ...prevState,
      [departmentId]: !prevState[departmentId],
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const decoded = decodeJWT(token);
      setUserId(
        decoded?.[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || null
      );
    }
    fetchUsers();
  }, []);

  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl text-gray-600 text-center mb-6">Gerenciamento de Usuários</h1>
      {Object.keys(groupedUsers).map((departmentId) => {
        const usersInDepartment = groupedUsers[departmentId] as User[];
        const isExpanded = expandedDepartments[departmentId] || false;
  
        const departmentName = departmentNameMap[parseInt(departmentId)];
  
        return (
          <div
            key={departmentId}
            className="border rounded-lg shadow-sm mb-4 overflow-hidden"
          >
            <button
              onClick={() => toggleDepartment(departmentId)}
              className="flex justify-between items-center w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <h2 className="text-lg font-medium">
                {departmentName || "Sem Departamento"}
              </h2>
              <span className="text-gray-500">{isExpanded ? "▲" : "▼"}</span>
            </button>
            {isExpanded && (
              <ul className="px-4 py-2 bg-white">
                <li className="flex justify-between items-center py-2 border-b last:border-none">
                  
                  <div className="space-x-2">
                    <button
                      onClick={() => handleUpdateDepartmentRedirect(parseInt(departmentId))}
                      className="px-3 py-1 text-md text-white bg-green-600 rounded hover:bg-green-700"
                    >
                      Atualizar Departamento
                    </button>
                  </div>
                </li>
                {usersInDepartment.map((user: User) => (
                  <li
                    key={user.id}
                    className="flex justify-between items-center py-2 border-b last:border-none"
                  >
                    <span>
                      <strong>{user.fullName}</strong>
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdateRedirect(user.id)}
                        className="px-3 py-1 text-md text-white bg-blue-600 rounded hover:bg-blue-700"
                      >
                        Atualizar
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="px-3 py-1 text-md text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};


export default ConfigPage;
