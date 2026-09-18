import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useCursor } from '@react-three/drei'
import * as THREE from 'three'

export default function Elevator({ project, position, rotation, isOpen, onClick }) {
  const leftDoorRef = useRef()
  const rightDoorRef = useRef()
  const glowRef = useRef()
  
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((state, delta) => {
    // Les portes s'ouvrent en coulissant vers les côtés pour se cacher derrière les piliers
    // Porte de 0.8 de large. Centre initial: -0.4. Centre final: -1.2 (cachée)
    const targetLeftX = isOpen ? -1.2 : -0.4
    const targetRightX = isOpen ? 1.2 : 0.4
    
    if (leftDoorRef.current) {
      leftDoorRef.current.position.x = THREE.MathUtils.lerp(leftDoorRef.current.position.x, targetLeftX, delta * 4)
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.x = THREE.MathUtils.lerp(rightDoorRef.current.position.x, targetRightX, delta * 4)
    }

    // Intensify red glow
    if (glowRef.current) {
      const targetIntensity = hovered ? 5 : (isOpen ? 3 : 0.5)
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, targetIntensity, delta * 5)
    }
  })

  // Matériaux optimisés (créés une seule fois)
  const frameMaterial = new THREE.MeshStandardMaterial({ color: "#2a2a2a", metalness: 0.8, roughness: 0.5 })
  const doorMaterial = new THREE.MeshStandardMaterial({ color: "#666666", metalness: 0.6, roughness: 0.4 })
  const detailMaterial = new THREE.MeshStandardMaterial({ color: "#111111", metalness: 0.9, roughness: 0.2 })

  return (
    <group 
      position={position} 
      rotation={rotation} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* --- STRUCTURE DU CADRE (z = 0.15) --- */}
      {/* Pilier Gauche */}
      <mesh position={[-1.2, 1.4, 0.15]}>
        <boxGeometry args={[0.8, 2.8, 0.1]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      {/* Pilier Droit */}
      <mesh position={[1.2, 1.4, 0.15]}>
        <boxGeometry args={[0.8, 2.8, 0.1]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      {/* Poutre Supérieure */}
      <mesh position={[0, 2.9, 0.15]}>
        <boxGeometry args={[3.2, 0.2, 0.1]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* --- INTERIEUR DE L'ASCENSEUR (Cabine 3D profonde) --- */}
      {/* Mur du fond */}
      <mesh position={[0, 1.4, -1.5]}>
        <planeGeometry args={[1.6, 2.8]} />
        <meshStandardMaterial color="#330000" roughness={0.8} />
      </mesh>
      {/* Mur gauche intérieur */}
      <mesh position={[-0.8, 1.4, -0.75]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 2.8]} />
        <meshStandardMaterial color="#220000" roughness={0.8} />
      </mesh>
      {/* Mur droit intérieur */}
      <mesh position={[0.8, 1.4, -0.75]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 2.8]} />
        <meshStandardMaterial color="#220000" roughness={0.8} />
      </mesh>
      {/* Plafond intérieur */}
      <mesh position={[0, 2.8, -0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 1.5]} />
        <meshStandardMaterial color="#110000" roughness={0.8} />
      </mesh>
      {/* Sol intérieur */}
      <mesh position={[0, 0, -0.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 1.5]} />
        <meshStandardMaterial color="#220000" roughness={0.8} />
      </mesh>

      {/* --- PORTES COULISSANTES (z = 0.05) --- */}
      {/* Porte Gauche */}
      <group position={[-0.4, 1.4, 0.05]} ref={leftDoorRef}>
        <mesh>
          <boxGeometry args={[0.8, 2.8, 0.04]} />
          <primitive object={doorMaterial} attach="material" />
        </mesh>
        <mesh position={[0.35, 0, 0.02]}>
          <boxGeometry args={[0.02, 2.8, 0.02]} />
          <primitive object={detailMaterial} attach="material" />
        </mesh>
      </group>

      {/* Porte Droite */}
      <group position={[0.4, 1.4, 0.05]} ref={rightDoorRef}>
        <mesh>
          <boxGeometry args={[0.8, 2.8, 0.04]} />
          <primitive object={doorMaterial} attach="material" />
        </mesh>
        <mesh position={[-0.35, 0, 0.02]}>
          <boxGeometry args={[0.02, 2.8, 0.02]} />
          <primitive object={detailMaterial} attach="material" />
        </mesh>
      </group>

      {/* --- DETAILS ET LUMIERES --- */}
      {/* Lueur rouge sortant de l'ascenseur (placée au fond de la cabine) */}
      <spotLight 
        ref={glowRef}
        position={[0, 2.5, -1.0]} 
        angle={Math.PI / 2.5} 
        penumbra={0.5} 
        intensity={2} 
        color="#ff0000"
        distance={15}
      >
        <object3D position={[0, 0, 2]} attach="target" />
      </spotLight>

      {/* Lumières intérieures de la cabine */}
      <pointLight position={[0, 2.0, -0.75]} color="#ff0000" intensity={1.5} distance={5} />
      
      {/* Plafonniers de l'ascenseur */}
      <mesh position={[-0.4, 2.75, -0.75]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial emissive="#ff0000" emissiveIntensity={2} color="#ff0000" />
      </mesh>
      <mesh position={[0.4, 2.75, -0.75]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial emissive="#ff0000" emissiveIntensity={2} color="#ff0000" />
      </mesh>

      {/* Cadran au-dessus */}
      <group position={[0, 3.2, 0.15]}>
        <mesh>
          <boxGeometry args={[0.8, 0.3, 0.05]} />
          <primitive object={detailMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <circleGeometry args={[0.12, 32, 0, Math.PI]} />
          <meshStandardMaterial color="#ffedcc" emissive="#ffedcc" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0.04]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.01, 0.1, 0.01]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      </group>

      {/* Panneau d'appel avec le numéro CV */}
      <group position={[1.3, 1.5, 0.22]}>
        <mesh>
          <boxGeometry args={[0.2, 0.4, 0.02]} />
          <primitive object={detailMaterial} attach="material" />
        </mesh>
        <Text
          position={[0, 0.1, 0.015]}
          fontSize={0.08}
          color="#ff0000"
          anchorX="center"
          anchorY="middle"
        >
          {project.roomNumber}
        </Text>
        <mesh position={[0, -0.1, 0.015]}>
          <circleGeometry args={[0.03, 16]} />
          <meshStandardMaterial color={hovered ? "#ff0000" : "#550000"} emissive="#ff0000" emissiveIntensity={hovered ? 2 : 0} />
        </mesh>
      </group>
      
      {/* Lumière permanente pour éclairer l'ascenseur (sinon il est trop noir) */}
      <spotLight 
        position={[0, 4, 3]} 
        angle={Math.PI / 3} 
        penumbra={0.5} 
        intensity={2.5} 
        color="#ffffff"
        distance={15}
      >
        <object3D position={[0, 1.5, 0]} attach="target" />
      </spotLight>
    </group>
  )
}
