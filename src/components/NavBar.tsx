import React, { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  const handleClickOutside = (event) => {
    if (isSidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.toggle-button')) {
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

// App.js (exemplo de uso)
// import Navbar from './components/Navbar';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// function App() {
//   return (
//     <Router>
//       <div>
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/adicionar-projetos" element={<AdicionarProjetos />} />
//           <Route path="/listar-projetos" element={<ListarProjetos />} />
//           <Route path="/adicionar-usuarios" element={<AdicionarUsuarios />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }
// export default App;
