import React, { createContext, useContext, useState, ReactNode } from "react";

interface Project {
  id: string;
  title: string;
  projectNumber: number;
  status: number;
  originDate: string;
  isDeleted: boolean;
}

interface ProjectContextData {
  projects: Project[];
  addProject: (project: Project) => void;
  setProjects: (projects: Project[]) => void;
}

const ProjectContext = createContext<ProjectContextData | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = (project: Project) => {
    setProjects((prevProjects) => [project, ...prevProjects]);
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, setProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
