import React, { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

export default function Door({ project, position, rotation, isOpen, onClick }) {
  const [hovered, setHovered] = useState(false)
  const materialRef = useRef()
  const hingeRef = useRef()

  useFrame((state, delta) => {
    if (materialRef.current) {
      const targetEmissive = hovered ? new THREE.Color(project.color || '#ffffff') : new THREE.Color('#000000')
      const targetIntensity = hovered ? 0.15 : 0
      
      materialRef.current.emissive.lerp(targetEmissive, delta * 5)
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, targetIntensity, delta * 5)
    }

    if (hingeRef.current) {
      const targetRotationY = isOpen ? -Math.PI / 2 : 0
      hingeRef.current.rotation.y = THREE.MathUtils.damp(hingeRef.current.rotation.y, targetRotationY, 4, delta)
    }
  })

  const doorColor = "#f4f0e6"
  const frameColor = "#eadecc"

  return (
    <group position={position} rotation={rotation}>
      {/* Encadrement de la porte (construit en 3 morceaux pour avoir un trou au milieu) */}
      {/* On les rend plus larges pour qu'ils débordent sur le papier peint et cachent le trou */}
      <group position={[0, 0, 0]}>
        {/* Poteau gauche (déborde de -0.7 à -0.9) */}
        <RoundedBox args={[0.2, 2.4, 0.1]} position={[-0.8, 1.2, 0]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color={frameColor} roughness={0.6} />
        </RoundedBox>
        {/* Poteau droit (déborde de 0.7 à 0.9) */}
        <RoundedBox args={[0.2, 2.4, 0.1]} position={[0.8, 1.2, 0]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color={frameColor} roughness={0.6} />
        </RoundedBox>
        {/* Poutre supérieure (déborde de 2.4 à 2.6 en hauteur, et couvre les deux poteaux en largeur) */}
        <RoundedBox args={[1.8, 0.2, 0.1]} position={[0, 2.5, 0]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color={frameColor} roughness={0.6} />
        </RoundedBox>
      </group>

      {/* Intérieur de la chambre en 3D (Cabine profonde) */}
      <mesh position={[0, 1.3, -1.35]}>
        {/* On fait la pièce plus large (2.0) et plus haute (2.6) que l'ouverture de la porte (1.4 x 2.4) */}
        <boxGeometry args={[2.0, 2.6, 2.5]} />
        {/* On applique des couleurs différentes aux murs, sol et plafond pour que la 3D soit visible */}
        <meshStandardMaterial attach="material-0" color={project.color || "#ffffff"} side={THREE.BackSide} roughness={0.9} /> {/* Mur Droit */}
        <meshStandardMaterial attach="material-1" color={project.color || "#ffffff"} side={THREE.BackSide} roughness={0.9} /> {/* Mur Gauche */}
        <meshStandardMaterial attach="material-2" color="#111" side={THREE.BackSide} roughness={0.9} /> {/* Plafond */}
        <meshStandardMaterial attach="material-3" color="#222" side={THREE.BackSide} roughness={0.9} /> {/* Sol */}
        <meshBasicMaterial attach="material-4" visible={false} /> {/* Face avant (invisible) */}
        <meshStandardMaterial attach="material-5" color={project.color || "#ffffff"} side={THREE.BackSide} roughness={0.9} /> {/* Mur du fond */}
      </mesh>
      
      {/* Éclairage intérieur de la chambre */}
      <pointLight 
        position={[0, 1.5, -1.0]} 
        intensity={isOpen ? 1.5 : 0} 
        distance={4} 
        color={project.color || "#ffffff"} 
      />

      {/* Charnière */}
      <group 
        ref={hingeRef} 
        position={[-0.7, 1.25, 0.05]}
      >
        <group 
          position={[0.7, 0, 0]} 
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          {/* Porte principale arrondie */}
          <RoundedBox args={[1.4, 2.4, 0.05]} radius={0.01} smoothness={4}>
            <meshStandardMaterial 
              ref={materialRef}
              color={doorColor}
              roughness={0.5}
            />
          </RoundedBox>
          
          {/* Panneaux décoratifs arrondis */}
          <RoundedBox args={[0.5, 0.8, 0.02]} radius={0.01} smoothness={4} position={[-0.35, 0.6, 0.03]}>
            <meshStandardMaterial color={doorColor} roughness={0.5} />
          </RoundedBox>
          <RoundedBox args={[0.5, 0.8, 0.02]} radius={0.01} smoothness={4} position={[0.35, 0.6, 0.03]}>
            <meshStandardMaterial color={doorColor} roughness={0.5} />
          </RoundedBox>
          <RoundedBox args={[0.5, 0.8, 0.02]} radius={0.01} smoothness={4} position={[-0.35, -0.5, 0.03]}>
            <meshStandardMaterial color={doorColor} roughness={0.5} />
          </RoundedBox>
          <RoundedBox args={[0.5, 0.8, 0.02]} radius={0.01} smoothness={4} position={[0.35, -0.5, 0.03]}>
            <meshStandardMaterial color={doorColor} roughness={0.5} />
          </RoundedBox>
          
          {/* Poignée de porte métallique réaliste */}
          <mesh position={[0.55, 0, 0.05]}>
            <sphereGeometry args={[0.04, 32, 32]} />
            <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
          </mesh>
          
          <Text
            position={[0, 0.1, 0.03]}
            fontSize={0.15}
            color="#222"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
          >
            {project.roomNumber}
          </Text>
          
          <Text
            position={[0, -0.1, 0.03]}
            fontSize={0.06}
            color="#444"
            anchorX="center"
            anchorY="middle"
          >
            {project.date}
          </Text>
        </group>
      </group>

      {/* Lumière permanente pour mettre la porte en valeur dans le couloir sombre */}
      <spotLight 
        position={[0, 2.5, 1.5]} 
        target={hingeRef.current}
        angle={Math.PI / 4} 
        penumbra={0.8} 
        intensity={2.5} 
        color="#ffffff"
        distance={6}
      />

      {/* Lumière colorée supplémentaire au survol (toujours montée pour éviter la recompilation des shaders, seule l'intensité change) */}
      <spotLight 
        position={[0, 2.5, 2]} 
        target={hingeRef.current}
        angle={Math.PI / 4} 
        penumbra={1} 
        intensity={hovered ? 2 : 0} 
        color={project.color || "#ffffff"}
        distance={5}
      />
    </group>
  )
}
