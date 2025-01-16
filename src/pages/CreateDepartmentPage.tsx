import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  fullName: string;
  role: string;
}

const CreateDepartmentPage = () => {
  const [name, setName] = useState<string>("");
  const [liderId, setLiderId] = useState<number | null>(null);
  const [gestorId, setGestorId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("jwt");
      const response = await fetch("http://192.168.16.240:5002/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.filter((user: User) => user.role === "Lider" || user.role === "Gestor"));
        setLoading(false);
      } else {
        console.error("Erro ao buscar usuários");
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");

    // Dados que serão enviados para a API
    const newDepartment = {
      name,
      liderId: liderId || null,
      gestorId: gestorId || null,
    };

    console.log("Dados sendo enviados:", newDepartment); // Log dos dados enviados

    const response = await fetch("http://192.168.16.240:5002/api/departments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newDepartment),
    });

    if (response.ok) {
      console.log("Departamento criado com sucesso!");
      navigate("/configuracoes"); // Redireciona para a lista de departamentos após a criação
    } else {
      console.error("Erro ao criar departamento");
      const errorData = await response.json(); // Captura a resposta de erro da API
      console.error("Detalhes do erro:", errorData);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl text-gray-600 text-center mb-6">Criar Departamento</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome do Departamento</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Líder</label>
          <select
            value={liderId || ""}
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
            value={gestorId || ""}
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
          Criar Departamento
        </button>
      </form>
    </div>
  );
};

export default CreateDepartmentPage;