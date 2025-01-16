import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


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
    LíderId: number;
    gestorId: number;
    users: User;
}

const UpdateUserPage = () => {
  const { id } = useParams<{ id: string }>(); // Obtém o ID da URL
  const navigate = useNavigate(); // Para redirecionar após salvar
  const [user, setUser] = useState({
    fullName: "",
    role: "",
    departmentId: 0,
  });
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]); 

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    fetch('http://192.168.16.240:5002/api/departments', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setDepartments(data.data); // Armazena os departamentos
        })
        .catch((error) => {
          console.error("Error fetching departments:", error);
        });
  

    fetch(`http://192.168.16.240:5002/api/users/${id}`, {
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
        setUser(data); // Define os dados do usuário
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const token = localStorage.getItem("jwt");
  
    // Exibe o conteúdo do 'user' para verificar o que está sendo enviado
    console.log("Dados sendo enviados:", { ...user, id });  // Verificando se o id está presente tanto no corpo quanto na URL
  
    fetch(`http://192.168.16.240:5002/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...user, id }),  // Garantir que o 'id' está incluído no corpo
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        console.log("User updated successfully");
        navigate("/configuracoes"); // Redireciona para a página inicial
      })
      .catch((error) => {
        console.error("Error updating user:", error);
      });
  };
  

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">

<button
      onClick={() => navigate(-1)}
      className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all mt-2"
    >
      Voltar
    </button>
      <h1 className="text-2xl text-gray-600 text-center mb-6">Atualizar Usuário</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome Completo</label>
          <input
            type="text"
            name="fullName"
            value={user.fullName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            name="role"
            value={user.role}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option disabled value="">Selecione uma opção</option>
            <option value="Colaborador">Colaborador</option>
            <option value="Admin">Admin</option>
            <option value="Lider">Líder</option>
            <option value="Gestor">Gestor</option>

          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Departamento</label>
          <select
            name="departmentId"
            value={user.departmentId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value={0}>Selecione um departamento</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Salvar
        </button>
      </div>
    </div>
  );
};

export default UpdateUserPage;