import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ProjectProvider } from "./context/ProjectContext.tsx";


createRoot(document.getElementById('root')!).render(
  <ProjectProvider>
    <StrictMode>
      <App />
    </StrictMode>,
  </ProjectProvider>,
)
