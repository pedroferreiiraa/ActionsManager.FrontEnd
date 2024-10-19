import React from 'react';
import 'tailwindcss/tailwind.css';
import { useNavigate } from 'react-router-dom';

type NavbarProps = object;

const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();

  return (
    <div>

      <nav className="bg-gray-800 text-white p-4 flex items-center">
        <div className="flex items-center container">
          <span onClick={() => navigate('/home')} className="text-lg font-semibold">Sistema de gestão de ações</span>
        </div>
      </nav>


    </div>
  );
};

export default Navbar;

