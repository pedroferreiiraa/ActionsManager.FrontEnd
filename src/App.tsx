// src/App.tsx
import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/ProjectDetailsPage';
import ProjectListPage from './pages/ProjectListPage';

// Layout para rotas que terão a Navbar
const Layout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <div className="container mx-auto p-4">{children}</div>
  </>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/projects"
          element={
            <Layout>
              <ProjectListPage />
            </Layout>
          }
        />
        {/* Corrigindo a rota de detalhes do projeto */}
        <Route
          path="/projects/:id"
          element={
            <Layout>
              <DetailsPage />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
