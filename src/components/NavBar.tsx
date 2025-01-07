import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars,  FaTimes } from 'react-icons/fa';
import { getRole } from '../utils/authUtils';


const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = getRole(); // Exemplo de role para testar

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    // Lógica de logout (redirecionamento ou chamada de API)
    console.log('Logout');
    navigate('/login'); // Exemplo de redirecionamento
  };

  const buttonClasses =
  "bg-blue-600 px-4 py-2 font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none transition-all";

const mobileButtonClasses =
  "block w-52 text-left px-4 py-2 font-semibold rounded-lg bg-blue-600 ml-10 mt-2 mb-2 focus:outline-none transition-all";

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
          <><button
              onClick={() => navigate('/registro')}
              className={buttonClasses}
            >
              Adicionar Colaborador
            </button><button
              onClick={() => navigate('/listar-projetos')}
              className={buttonClasses}
            >
                Listar Projetos
              </button>
              <button
              onClick={() => navigate('/alterar-senha')}
              className={buttonClasses}
            >
                Alterar senha
              </button>
              <button
              onClick={() => navigate('/configuracoes')}
              className={buttonClasses}
            >
                Configurações
              </button>
              </>
        )}
        {role === 'Líder' && (
          <>
          <button
            onClick={() => navigate('/listar-projetos-setor')}
            className={buttonClasses}
          >
            Listar Projetos do Setor
          </button>
          <button
              onClick={() => navigate('/alterar-senha')}
              className={buttonClasses}
            >
                Alterar senha
              </button>
          </>
        )}
        {role === 'Colaborador' && (

            <><button
              onClick={() => navigate('/adicionar-projeto')}
              className={buttonClasses}
            >
              Adicionar Projeto
            </button><button
              onClick={() => navigate('/listar-meus-projetos')}
              className={buttonClasses}
            >
                Listar Meus Projetos
              </button>
              <button
              onClick={() => navigate('/alterar-senha')}
              className={buttonClasses}
            >
                Alterar senha
              </button>
              
              </>
              
        )}

        </div>
        
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 font-semibold rounded-lg sm:px px-2 sm:py py-1 shadow hover:bg-red-700 focus:outline-none transition-all flex items-center"
        >
          {/* <FaSignOutAlt className="inline-block  sm:block hidden" /> */}
          Sair
        </button>
        <div></div>
     
      </nav>

      {/* Menu suspenso para dispositivos móveis */}
      <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden text-white p-0`}>
  {role === 'Admin' && (
    <>
      <button
        onClick={() => navigate('/registro')}
        className={mobileButtonClasses}
      >
        Adicionar Colaborador
      </button>
      <button
        onClick={() => navigate('/listar-projetos')}
        className={mobileButtonClasses}
      >
        Listar Projetos
      </button>
      <button
        onClick={() => navigate('/alterar-senha')}
        className={mobileButtonClasses}
      >
        Alterar senha
      </button>
    </>
  )}
  {role === 'Líder' && (
    <>
    
    <button
      onClick={() => navigate('/listar-projetos-setor')}
      className={mobileButtonClasses}
    >
      Listar Projetos do Setor
    </button>
    <button
        onClick={() => navigate('/alterar-senha')}
        className={mobileButtonClasses}
      >
        Alterar senha
      </button>
    </>
    
  )}
  {role === 'Colaborador' && (
    <>
      <button
        onClick={() => navigate('/listar-meus-projetos')}
        className={mobileButtonClasses}
      >
        Listar Meus Projetos
      </button>
      <button
        onClick={() => navigate('/adicionar-projeto')}
        className={mobileButtonClasses}
      >
        Adicionar Projeto
      </button>
      <button
        onClick={() => navigate('/alterar-senha')}
        className={mobileButtonClasses}
      >
        Alterar senha
      </button>
      
    </>
  )}
</div>



    </div>
  );
};

export default Navbar;
