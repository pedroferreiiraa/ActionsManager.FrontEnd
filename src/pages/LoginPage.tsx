import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError({});

  
    try {
      const response = await fetch('http://192.168.16.194:5002/api/users/login', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError({ general: 'Login falhou! Usuário ou senha incorretos.' });
        } else if (response.status >= 500) {
          setError({ general: 'Login ou senha incorretos.' });
        } else {
          throw new Error('Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.');
        }
        return;
      }

      const data = await response.json();
      // Armazena o token no localStorage (caso a API retorne um token)
      localStorage.setItem('token', data.token);
      navigate('/home'); // Redireciona para a Home
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/registro'); // Substitua '/registro' pela rota da página de registro
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2C9.243 2 7 4.243 7 7v3H5a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V11a1 1 0 00-1-1h-2V7c0-2.757-2.243-5-5-5zm-1 7V7a1 1 0 012 0v2h-2zm8 11H5V12h14v8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Login</h2>
        </div>

        {loading ? (
          <div className="flex justify-center mt-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-1">
                Login
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {error.email && <div className="text-red-500 mt-1">{error.email}</div>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {error.password && <div className="text-red-500 mt-1">{error.password}</div>}
              {error.general && <div className="text-red-500 mt-2">{error.general}</div>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none"
            >
              Entrar
            </button>
            <button
              type="button"
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 focus:outline-none"
              onClick={handleRegisterClick}
            >
              Cadastrar-se
            </button>
          </form>
          
        )}
      </div>
    </div>
  );
};

export default Login;
