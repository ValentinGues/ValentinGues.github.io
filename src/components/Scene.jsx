import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Preload, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import Door from './Door'
import Elevator from './Elevator'
import Corridor from './Corridor'

export default function Scene({ onDoorClick, projects, selectedProject, doorIndex }) {
  const cameraTarget = useRef(new THREE.Vector3(0, 1.5, -10))
  
  const regularProjects = projects.filter(p => !p.isContact)
  const contactProject = projects.find(p => p.isContact)
  
  const doorSpacing = 8
  const maxRegularIndex = regularProjects.length - 1
  const lastRegularDoorZ = -maxRegularIndex * doorSpacing
  
  // La porte de contact est tout au fond
  const contactDoorZ = lastRegularDoorZ - doorSpacing
  
  // Le couloir s'adapte dynamiquement au nombre de portes
  const corridorStartZ = 6
  const corridorEndZ = contactDoorZ - 0.05

  useFrame((state, delta) => {
    let targetZ;
    if (doorIndex === 0) {
      targetZ = corridorStartZ - 1;
    } else {
      const doorActualIndex = doorIndex - 1;
      if (doorActualIndex < regularProjects.length) {
         targetZ = -doorActualIndex * doorSpacing + 1.5;
      } else {
         targetZ = contactDoorZ + 3;
      }
    }
    
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 4, delta)
    
    let closestDoor = null
    let minDistance = Infinity
    
    regularProjects.forEach((proj, index) => {
      const isLeft = index % 2 === 0
      const doorZ = -index * doorSpacing
      const distance = Math.abs(state.camera.position.z - doorZ)
      
      if (distance < minDistance) {
        minDistance = distance
        closestDoor = { isLeft, doorZ, isContact: false }
      }
    })

    if (contactProject) {
      const distanceToContact = Math.abs(state.camera.position.z - contactDoorZ)
      if (distanceToContact < minDistance) {
        minDistance = distanceToContact
        closestDoor = { doorZ: contactDoorZ, isContact: true }
      }
    }
    
    if (closestDoor && minDistance < 4) {
      let influence = 0
      let idealTargetZ = state.camera.position.z - 10
      // Sur mobile, on se décale moins pour ne pas avoir le nez collé à la porte
      const isMobile = window.innerWidth < 768;
      const targetOffset = isMobile ? 1.0 : 2.0;
      const targetX = closestDoor.isLeft ? -targetOffset : targetOffset;

      if (closestDoor.isContact) {
        // Logique spéciale pour la porte de fin (toujours au centre)
        influence = Math.max(0, 1 - (minDistance / 4))
        cameraTarget.current.x = THREE.MathUtils.damp(cameraTarget.current.x, 0, 4, delta)
        cameraTarget.current.z = THREE.MathUtils.damp(cameraTarget.current.z, closestDoor.doorZ, 4, delta)
      } else {
        // Logique pour les portes latérales
        const isApproaching = state.camera.position.z >= closestDoor.doorZ
        
        if (isApproaching) {
          if (minDistance <= 2) {
            // "Sweet spot" : on verrouille parfaitement la porte au centre de l'écran quand on est proche
            influence = 1
            idealTargetZ = closestDoor.doorZ
          } else {
            // Transition douce en approchant
            influence = (4 - minDistance) / 2
            idealTargetZ = THREE.MathUtils.lerp(state.camera.position.z - 10, closestDoor.doorZ, influence)
          }
        } else {
          // En dépassant la porte, on repasse progressivement vers l'avant pour éviter le bug du 360°
          influence = Math.max(0, 1 - (minDistance / 4))
          idealTargetZ = THREE.MathUtils.lerp(state.camera.position.z - 10, closestDoor.doorZ, influence)
        }

        cameraTarget.current.x = THREE.MathUtils.damp(cameraTarget.current.x, targetX * influence, 4, delta)
        cameraTarget.current.z = THREE.MathUtils.damp(cameraTarget.current.z, idealTargetZ, 4, delta)
      }
      cameraTarget.current.y = 1.5
    } else {
      cameraTarget.current.x = THREE.MathUtils.damp(cameraTarget.current.x, 0, 4, delta)
      cameraTarget.current.y = 1.5
      cameraTarget.current.z = THREE.MathUtils.damp(cameraTarget.current.z, state.camera.position.z - 10, 4, delta)
    }
    
    state.camera.lookAt(cameraTarget.current)
  })

  return (
    <group>
      <Environment preset="night" />
      <ambientLight intensity={0.02} color="#222233" />
      
      <Corridor startZ={corridorStartZ} endZ={corridorEndZ} projects={regularProjects} />
      
      {regularProjects.map((project, index) => {
        const isLeft = index % 2 === 0
        const zPosition = -index * doorSpacing
        const position = [isLeft ? -1.9 : 1.9, 0, zPosition]
        const rotation = [0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]
        
        return (
          <Door 
            key={project.id}
            project={project}
            position={position}
            rotation={rotation}
            isOpen={selectedProject?.id === project.id}
            onClick={() => onDoorClick(project.id)}
          />
        )
      })}

      {contactProject && (
        <Elevator 
          key={contactProject.id}
          project={contactProject}
          position={[0, 0, contactDoorZ]}
          rotation={[0, 0, 0]}
          isOpen={selectedProject?.id === contactProject.id}
          onClick={() => onDoorClick(contactProject.id)}
        />
      )}

      {/* Force la compilation de tous les shaders des objets cachés pour éviter le lag in-game */}
      <Preload all />
    </group>
  )
}
