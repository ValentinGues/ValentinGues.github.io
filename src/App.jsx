import React, { useState, Suspense, lazy } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import NetflixMenu from './components/NetflixMenu'
import { projectsData } from './projectsData'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'

// Code splitting pour ne pas charger le gros moteur 3D sur la vue Netflix
const OverlookUI = lazy(() => import('./components/OverlookUI'))

// NetflixRoute Wrapper to handle modal in NetflixMenu
function NetflixRoute() {
  const [selectedProject, setSelectedProject] = useState(null)

  const handleProjectClick = (projectId) => {
    const project = projectsData.find(p => p.id === projectId)
    if (project) {
      setSelectedProject(project)
    }
  }

  const closeModal = () => setSelectedProject(null)

  return (
    <>
      <NetflixMenu 
        projects={projectsData} 
        onProjectClick={handleProjectClick} 
      />
      
      {/* Modal is shared for Netflix mode too */}
      <div className="ui-layer" style={{ zIndex: 1000, pointerEvents: selectedProject ? 'auto' : 'none' }}>
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              style={{ pointerEvents: 'auto' }}
            >
              <motion.div
                className="project-modal"
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-button" onClick={closeModal}>
                  <X size={24} />
                </button>
                
                <div className="project-header">
                  <div className="project-meta">
                    <span>Chambre {selectedProject.roomNumber}</span>
                    <span>&bull;</span>
                    <span>{selectedProject.date}</span>
                  </div>
                  <h2>{selectedProject.title}</h2>
                </div>
                
                <div className="project-content">
                  <p>{selectedProject.description}</p>
                  
                  <div className="project-tech">
                    {selectedProject.tech.map(tech => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  
                  <div className="project-demo">
                    <a href={selectedProject.demoUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={18} />
                      Voir la démo
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', marginTop: '50vh' }}>Chargement de l'Overlook...</div>}>
            <OverlookUI />
          </Suspense>
        } />
        <Route path="/netflix" element={<NetflixRoute />} />
      </Routes>
    </Router>
  )
}

export default App
