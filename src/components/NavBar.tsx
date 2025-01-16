import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { getRole, getUserIdFromToken } from '../utils/authUtils'; // Adicione uma função para obter o ID do usuário
import axios from 'axios';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState<number | null>(null); // Estado para armazenar o ID do departamento
  const role = getRole(); // Exemplo de role para testar

  // Função para buscar o ID do departamento do usuário logado
  useEffect(() => {
    const fetchUserDepartment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token não encontrado.');
        }

        // Obtém o ID do usuário logado
        const userId = getUserIdFromToken(token);

        if (!userId) {
          throw new Error('ID do usuário não encontrado no token.');
        }

        // Faz a requisição para buscar as informações do usuário logado
        const response = await axios.get(`http://192.168.16.240:5002/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data;

        // Verifica se o usuário é um líder e tem um departmentId
        if (userData.role === 'Lider' && userData.departmentId) {
          setDepartmentId(userData.departmentId); // Armazena o ID do departamento
        }
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
      }
    };

    fetchUserDepartment();
  }, []);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    // Lógica de logout (redirecionamento ou chamada de API)
    console.log('Logout');
    navigate('/login'); // Exemplo de redirecionamento
  };

  const buttonClasses =
    'bg-blue-600 px-4 py-2 font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all';

  const mobileButtonClasses =
    'block w-52 text-left px-4 py-2 font-semibold rounded-lg bg-blue-600 ml-10 mt-2 mb-2 focus:outline-none transition-all';

  return (
    <div>
      <nav className="bg-gray-100 text-white p-2 flex items-center justify-between mb-1">
        <div></div>
        <span onClick={() => navigate('/home')} className="text-lg text-gray-700 font-semibold">
          DoalPlastic
        </span>

        {/* Ícone de menu para dispositivos móveis */}
        <div className="md:hidden flex items-center">
          <button onClick={handleMenuToggle}>
            {menuOpen ? (
              <FaTimes className="text-black text-2xl" />
            ) : (
              <FaBars className="text-black text-2xl" />
            )}
          </button>
        </div>

        {/* Menu visível em dispositivos maiores */}
        <div className={`md:flex space-x-6 sm:block hidden ${menuOpen ? 'hidden' : 'block'}`}>
          {role === 'Admin' && (
            <>
              <button onClick={() => navigate('/registro')} className={buttonClasses}>
                Adicionar Colaborador
              </button>
              <button onClick={() => navigate('/listar-projetos')} className={buttonClasses}>
                Listar Projetos
              </button>
              {/* <button onClick={() => navigate('/alterar-senha')} className={buttonClasses}>
                Alterar senha
              </button> */}
              <button onClick={() => navigate('/configuracoes')} className={buttonClasses}>
                Configurações
              </button>
            </>
          )}
          {role === 'Lider' && (
            <>
              <button
                onClick={() => navigate(`/listar-projetos-setor/${departmentId}`)} // Usa o departmentId na navegação
                className={buttonClasses}
              >
                Listar Projetos do Setor
              </button>
              {/* <button onClick={() => navigate('/alterar-senha')} className={buttonClasses}>
                Alterar senha
              </button> */}
            </>
          )}
          {role === 'Gestor' && (
            <>
              <button onClick={() => navigate(`/departments`)} className={buttonClasses}>
                Listar setores
              </button>
              {/* <button onClick={() => navigate('/alterar-senha')} className={buttonClasses}>
                Alterar senha
              </button> */}
            </>
          )}
          {role === 'Colaborador' && (
            <>
              <button onClick={() => navigate('/adicionar-projeto')} className={buttonClasses}>
                Adicionar Projeto
              </button>
              <button onClick={() => navigate('/listar-meus-projetos')} className={buttonClasses}>
                Listar Meus Projetos
              </button>
              {/* <button onClick={() => navigate('/alterar-senha')} className={buttonClasses}>
                Alterar senha
              </button> */}
            </>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 font-semibold rounded-lg sm:px px-2 sm:py py-1 shadow hover:bg-red-700 focus:outline-none transition-all flex items-center"
        >
          Sair
        </button>
        <div></div>
      </nav>

      {/* Menu suspenso para dispositivos móveis */}
      <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden text-white p-0`}>
        {role === 'Admin' && (
          <>
            <button onClick={() => navigate('/registro')} className={mobileButtonClasses}>
              Adicionar Colaborador
            </button>
            <button onClick={() => navigate('/listar-projetos')} className={mobileButtonClasses}>
              Listar Projetos
            </button>
            {/* <button onClick={() => navigate('/alterar-senha')} className={mobileButtonClasses}>
              Alterar senha
            </button> */}
            <button onClick={() => navigate('/configuracoes')} className={mobileButtonClasses}>
                Configurações
              </button>
          </>
        )}
        {role === 'Lider' && (
          <>
            <button
              onClick={() => navigate(`/listar-projetos-setor/${departmentId}`)} // Usa o departmentId na navegação
              className={mobileButtonClasses}
            >
              Listar Projetos do Setor
            </button>
            {/* <button onClick={() => navigate('/alterar-senha')} className={mobileButtonClasses}>
              Alterar senha
            </button> */}
          </>
        )}
        {role === 'Colaborador' && (
          <>
            <button onClick={() => navigate('/listar-meus-projetos')} className={mobileButtonClasses}>
              Listar Meus Projetos
            </button>
            <button onClick={() => navigate('/adicionar-projeto')} className={mobileButtonClasses}>
              Adicionar Projeto
            </button>
            {/* <button onClick={() => navigate('/alterar-senha')} className={mobileButtonClasses}>
              Alterar senha
            </button> */}
          </>
        )}
        {role === 'Gestor' && (
          <>
           <button onClick={() => navigate(`/departments`)} className={mobileButtonClasses}>
                Listar setores
              </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;