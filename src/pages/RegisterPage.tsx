import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification'; // Importe o componente de notificação

interface RegisterFormData {
  fullName: string;
  password: string;
  email: string;
  role: string;
  departmentId: number;
}

interface Department {
  id: number;
  name: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    password: '',
    email: '',
    role: 'Colaborador',
    departmentId: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      navigate('/login'); // Redireciona para login se o token não estiver presente
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/departments', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Erro ao buscar departamentos');
        }
        const data = await response.json();
        setDepartments(data.data); // Definimos a lista de departamentos no estado
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchDepartments();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'departmentId' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.password || !formData.email || !formData.role) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users', { // Altere para a URL correta
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao registrar o usuário. Tente novamente.');
      }

      setShowNotification(true); // Exibe a notificação de sucesso
      setTimeout(() => navigate('/login'), 1000); // Redireciona após 3 segundos
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">Registrar-se</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Nome Completo</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Login</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Nível no Sistema</label>
            <input
                disabled
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Departamento</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              required
            >
              <option value="">Selecione o Departamento</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 focus:outline-none"
          >
            Registrar
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm">
          Já tem uma conta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            Entre aqui
          </button>
        </p>
        
        {/* Notificação de Sucesso */}
        {showNotification && (
          <Notification
            message="Registro realizado com sucesso!"
            onClose={() => setShowNotification(false)}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
