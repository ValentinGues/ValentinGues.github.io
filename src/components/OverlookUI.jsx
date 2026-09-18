import React, { useState, Suspense, useEffect, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ExternalLink, Tv } from 'lucide-react'
import Scene from './Scene'
import { projectsData } from '../projectsData'
import { useNavigate } from 'react-router-dom'

function CameraUpdater({ isMobile }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.fov = isMobile ? 100 : 60
    camera.updateProjectionMatrix()
  }, [isMobile, camera])
  return null
}

function SwipeManager({ onSwipeUp, onSwipeDown }) {
  useEffect(() => {
    let isScrolling = false
    let touchStartY = 0
    
    const trigger = (direction) => {
      if (isScrolling) return
      isScrolling = true
      if (direction > 0) onSwipeDown()
      else onSwipeUp()
      setTimeout(() => isScrolling = false, 800) // Cooldown pour éviter le zapping rapide
    }

    const handleWheel = (e) => {
      trigger(e.deltaY > 0 ? 1 : -1)
    }

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY
      const deltaY = touchStartY - touchEndY
      if (Math.abs(deltaY) > 40) { // Swipe de 40px minimum
        trigger(deltaY > 0 ? 1 : -1)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeUp, onSwipeDown])
  
  return null
}

function OverlookUI() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [doorIndex, setDoorIndex] = useState(0)
  const navigate = useNavigate()
  
  const maxDoors = projectsData.length

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleDoorClick = (projectId) => {
    const project = projectsData.find(p => p.id === projectId)
    if (project) {
      setSelectedProject(project)
    }
  }

  const closeModal = () => setSelectedProject(null)

  const handleSwipeDown = useCallback(() => {
    if (selectedProject) return
    setDoorIndex(prev => Math.min(prev + 1, maxDoors))
  }, [maxDoors, selectedProject])

  const handleSwipeUp = useCallback(() => {
    if (selectedProject) return
    setDoorIndex(prev => Math.max(prev - 1, 0))
  }, [selectedProject])

  const hasScrolled = doorIndex > 0

  return (
    <>
      <div className="fixed-container scroll-snap-wrapper">
        <SwipeManager onSwipeUp={handleSwipeUp} onSwipeDown={handleSwipeDown} />
        <Canvas
          camera={{ position: [0, 1.5, 8], fov: isMobile ? 100 : 60 }}
          dpr={[1, 2]}
          shadows
        >
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 10, 30]} />
          
          <CameraUpdater isMobile={isMobile} />
          
          <Suspense fallback={null}>
            <Scene onDoorClick={handleDoorClick} projects={projectsData} selectedProject={selectedProject} doorIndex={doorIndex} />
          </Suspense>
        </Canvas>
      </div>

      <AnimatePresence>
        {!hasScrolled && (
          <motion.div 
            className="instruction-overlay"
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05, x: "-50%", y: "-50%" }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          >
            <h1>Bienvenue à l'Overlook.</h1>
            <p>Chaque porte dissimule l'un de mes projets.</p>
            <p className="scroll-hint">Scrollez pour explorer les couloirs...</p>
            
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '2rem', backgroundColor: '#E50914', color: 'white', border: 'none', pointerEvents: 'auto' }}
              onClick={() => navigate('/netflix')}
            >
              <Tv size={20} />
              Accès Rapide (Mode Netflix)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ui-layer">
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
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

      <Loader
        containerStyles={{ background: '#050505' }}
        innerStyles={{ backgroundColor: '#222' }}
        barStyles={{ backgroundColor: '#d34e15' }}
        dataStyles={{ color: '#ffedcc', fontSize: '18px', fontFamily: 'sans-serif' }}
        dataInterpolation={(p) => `Enregistrement à la réception... ${p.toFixed(0)}%`}
      />
    </>
  )
}

export default OverlookUI
