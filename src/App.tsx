// src/App.tsx
import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AddProject from './pages/AddProjectPage';
import ListProjects from './pages/ListProjectsPage'
import ProjectDetails from './pages/ProjectDetails';
import AddAction from './pages/AddAction';
import UpdateProjectPage from './pages/UpdateProjectPage';
import RegisterPage from './pages/RegisterPage';
import ListProjectsDepartment from './pages/ListProjectsDepartmentPage';
import ListSelfProjects from './pages/ListSelfProjects';
import ConfigPage from './pages/ConfigPage';
import UpdateUserPage from './pages/UpdateUserPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import UpdateDepartmentPage from './pages/UpdateDepartmentPage';
import DepartmentsPage from './pages/DepartmentsPage';
import CreateDepartmentPage from './pages/CreateDepartmentPage';
// Layout para rotas que terão a Navbar
const Layout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <div className="container mx-auto">{children}</div>
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
          path="/adicionar-projeto" // Adicione esta rota
          element={
            <Layout>
              <AddProject />
            </Layout>
          }
        />
        <Route
          path="/listar-projetos" // Adicione esta rota
          element={
            <Layout>
              <ListProjects />
            </Layout>
          }
        />
        <Route
          path="/listar-meus-projetos" // Adicione esta rota
          element={
            <Layout>
              <ListSelfProjects />
            </Layout>
          }
        />
        <Route
          path="/listar-projetos-setor/:id" // Adicione esta rota
          element={
            <Layout>
              <ListProjectsDepartment />
            </Layout>
          }
        />
        <Route
          path="/listar-meus-projetos" // Adicione esta rota
          element={
            <Layout>
              <ListProjects />
            </Layout>
          }
        />
         <Route
          path="/projeto/:id" // Adicione esta rota
          element={
            <Layout>
              <ProjectDetails />
            </Layout>
          }
        />
      
        <Route 
        path="/projeto/:projectId/inserir-acao" 
        element={
          <Layout >
            <AddAction />
          </Layout>
      } 
      />

        <Route 
        path="/projeto/:id/update" 
        element={
          <Layout >
            <UpdateProjectPage />
          </Layout>
      } 
      />
      <Route 
        path="/registro" 
        element={
          <Layout >
            <RegisterPage />
          </Layout>
      } 
      />
        <Route 
        path="/configuracoes" 
        element={
          <Layout >
            <ConfigPage />
          </Layout>
      } 
      />
        <Route 
        path="/atualizar-usuario/:id" 
        element={
          <Layout >
            <UpdateUserPage />
          </Layout>
      } 
      />
         <Route 
        path="/alterar-senha" 
        element={
          <Layout >
            <ChangePasswordPage />
          </Layout>
      } 
      />
          <Route 
        path="/atualizar-departamento/:id" 
        element={
          <Layout >
            <UpdateDepartmentPage />
          </Layout>
      } 
      />
        <Route 
        path="/criar-departamento" 
        element={
          <Layout >
            <CreateDepartmentPage />
          </Layout>
      } 
      />
       <Route 
        path="/departments" 
        element={
          <Layout >
            <DepartmentsPage />
          </Layout>
      } 
      />

      </Routes>
    </Router>
  );
};

export default App;
