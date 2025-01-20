import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Department {
  id: number;
  name: string;
  liderId: number;
  gestorId: number;
}

interface User {
  id: number;
  fullName: string;
  role: string;
}

const UpdateDepartmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState<string>(""); // Valor inicial: string vazia
  const [liderId, setLiderId] = useState<number | null>(null); // Valor inicial: null
  const [gestorId, setGestorId] = useState<number | null>(null); // Valor inicial: null
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartment = async () => {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`http://192.168.16.194:5002/api/departments/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDepartment(data);
        setName(data.name || ""); // Garante que name seja uma string
        setLiderId(data.liderId || null); // Garante que liderId seja um número ou null
        setGestorId(data.gestorId || null); // Garante que gestorId seja um número ou null
      } else {
        console.error("Erro ao buscar departamento");
      }
    };

    const fetchUsers = async () => {
      const token = localStorage.getItem("jwt");
      const response = await fetch("http://192.168.16.194:5002/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.filter((user: User) => user.role === "Lider" || user.role === "Gestor"));
      } else {
        console.error("Erro ao buscar usuários");
      }
    };

    fetchDepartment();
    fetchUsers();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");

    // Dados que serão enviados para a API
    const updatedDepartment = {
      id: parseInt(id!),
      name: name || department?.name, // Mantém o nome atual se não for alterado
      liderId: liderId || department?.liderId, // Mantém o líder atual se não for alterado
      gestorId: gestorId || department?.gestorId, // Mantém o gestor atual se não for alterado
    };

    console.log("Dados sendo atualizados:", updatedDepartment); // Log dos dados atualizados

    const response = await fetch(`http://192.168.16.194:5002/api/departments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedDepartment),
    });

    if (response.ok) {
      console.log("Departamento atualizado com sucesso!");
      navigate("/configuracoes"); // Redireciona para a lista de departamentos após a atualização
    } else {
      console.error("Erro ao atualizar departamento");
      const errorData = await response.json(); // Captura a resposta de erro da API
      console.error("Detalhes do erro:", errorData);
    }
  };

  if (!department) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl text-gray-600 text-center mb-6">Atualizar Departamento</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Líder</label>
          <select
            value={liderId || ""} // Garante que o valor nunca seja undefined
            onChange={(e) => setLiderId(parseInt(e.target.value))}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Selecione um líder</option>
            {users
              .filter((user) => user.role === "Lider")
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gestor</label>
          <select
            value={gestorId || ""} // Garante que o valor nunca seja undefined
            onChange={(e) => setGestorId(parseInt(e.target.value))}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Selecione um gestor</option>
            {users
              .filter((user) => user.role === "Gestor")
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Atualizar Departamento
        </button>
      </form>
    </div>
  );
};

export default UpdateDepartmentPage;