import React, { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

type NavbarProps = object;

const Navbar: React.FC<NavbarProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (path: string): void => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  const handleClickOutside = (event: MouseEvent): void => {
    if (
      isSidebarOpen &&
      event.target instanceof HTMLElement &&
      !event.target.closest('.sidebar') &&
      !event.target.closest('.toggle-button')
    ) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (isSidebarOpen) {
      window.addEventListener('click', handleClickOutside);
    } else {
      window.removeEventListener('click', handleClickOutside);
    }

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-gray-800 text-white p-4 flex items-center">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-4 text-2xl focus:outline-none toggle-button">
            <FaBars />
          </button>
          <span className="text-lg font-semibold">Minha Aplicação</span>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 text-gray-900 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out sidebar`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Menu</h2>
          <button onClick={() => handleNavigation('/adicionar-projetos')} className="w-full text-left px-4 py-2 mb-2 bg-gray-300 rounded hover:bg-gray-400 focus:outline-none">
            Adicionar Projetos
          </button>
          <button onClick={() => handleNavigation('/listar-projetos')} className="w-full text-left px-4 py-2 mb-2 bg-gray-300 rounded hover:bg-gray-400 focus:outline-none">
            Listar Projetos
          </button>
          <button onClick={() => handleNavigation('/adicionar-usuarios')} className="w-full text-left px-4 py-2 mb-2 bg-gray-300 rounded hover:bg-gray-400 focus:outline-none">
            Adicionar Usuários
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

