// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-700 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">5W2H</h1>
        <ul className="flex font-bold space-x-4">
          <li>
            <Link to="/home" className="hover:underline">Home</Link>
          </li> 
          <li>
            <Link to="/projects" className="hover:underline">Projetos</Link>
          </li>
          {/* <li>
            <Link to="/profile" className="hover:underline">Perfil</Link>
          </li> */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
