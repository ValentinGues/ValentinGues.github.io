import React, { useMemo } from 'react'
import { useTexture, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

function createOverlookCarpetTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#d34e15'
  ctx.fillRect(0, 0, 512, 512)

  const drawHexPattern = (x, y) => {
    ctx.strokeStyle = '#3d1600'
    ctx.lineWidth = 18
    
    ctx.beginPath()
    ctx.moveTo(x - 50, y - 25)
    ctx.lineTo(x, y - 50)
    ctx.lineTo(x + 50, y - 25)
    ctx.lineTo(x + 50, y + 25)
    ctx.lineTo(x, y + 50)
    ctx.lineTo(x - 50, y + 25)
    ctx.closePath()
    ctx.stroke()
    
    ctx.fillStyle = '#8a1c11'
    ctx.beginPath()
    ctx.moveTo(x - 35, y - 17)
    ctx.lineTo(x, y - 35)
    ctx.lineTo(x + 35, y - 17)
    ctx.lineTo(x + 35, y + 17)
    ctx.lineTo(x, y + 35)
    ctx.lineTo(x - 35, y + 17)
    ctx.closePath()
    ctx.fill()
  }

  for(let i=0; i<=512; i+=100) {
    for(let j=0; j<=512; j+=86) {
      const offsetX = (Math.round(j/86) % 2 === 0) ? 0 : 50
      drawHexPattern(i + offsetX, j)
    }
  }

  ctx.strokeStyle = '#3d1600'
  ctx.lineWidth = 18
  for(let j=0; j<=512; j+=86) {
    ctx.beginPath()
    ctx.moveTo(0, j)
    ctx.lineTo(512, j)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

export default function Corridor({ startZ, endZ, projects = [] }) {
  const length = startZ - endZ
  const centerZ = (startZ + endZ) / 2

  const baseCarpetTexture = useMemo(() => createOverlookCarpetTexture(), [])
  const carpetTexture = baseCarpetTexture.clone()
  carpetTexture.repeat.set(2, length / 2)
  carpetTexture.needsUpdate = true

  const baseWallTexture = useTexture('/wallpaper.jpg')
  
  const sideWallTexture = baseWallTexture.clone()
  sideWallTexture.wrapS = THREE.RepeatWrapping
  sideWallTexture.wrapT = THREE.RepeatWrapping
  sideWallTexture.repeat.set(length / 3, 1)
  sideWallTexture.needsUpdate = true

  const endWallTexture = baseWallTexture.clone()
  endWallTexture.wrapS = THREE.RepeatWrapping
  endWallTexture.wrapT = THREE.RepeatWrapping
  endWallTexture.repeat.set(4 / 3, 1)
  endWallTexture.needsUpdate = true

  const pillarZs = []
  for (let z = Math.floor(startZ / 4) * 4 + 2; z >= endZ; z -= 4) {
    if (z <= startZ && z >= endZ) pillarZs.push(z)
  }
  
  const lampZs = []
  for (let z = 0; z >= endZ; z -= 8) {
    if (z - 4 >= endZ) lampZs.push(z - 4)
  }

  const corridorWidth = 4

  // --- CALCUL DES MURS LATERAUX AVEC TROUS ---
  const leftWalls = []
  const rightWalls = []
  
  let currentLeftZ = startZ
  let currentRightZ = startZ

  projects.forEach((proj, index) => {
    const isLeft = index % 2 === 0
    const doorZ = -index * 8
    
    // Le trou fait 1.6 de large (de doorZ + 0.8 à doorZ - 0.8)
    const holeStart = doorZ + 0.8
    const holeEnd = doorZ - 0.8

    if (isLeft) {
      if (currentLeftZ > holeStart) {
        const segLen = currentLeftZ - holeStart
        leftWalls.push(<mesh key={`lw-${index}`} position={[-2, 1.5, currentLeftZ - segLen/2]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[segLen, 3]} /><meshStandardMaterial map={sideWallTexture} roughness={0.9} /></mesh>)
      }
      // Dessus de la porte
      leftWalls.push(<mesh key={`lwt-${index}`} position={[-2, 2.75, doorZ]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[1.6, 0.5]} /><meshStandardMaterial map={sideWallTexture} roughness={0.9} /></mesh>)
      currentLeftZ = holeEnd
    } else {
      if (currentRightZ > holeStart) {
        const segLen = currentRightZ - holeStart
        rightWalls.push(<mesh key={`rw-${index}`} position={[2, 1.5, currentRightZ - segLen/2]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[segLen, 3]} /><meshStandardMaterial map={sideWallTexture} roughness={0.9} /></mesh>)
      }
      // Dessus de la porte
      rightWalls.push(<mesh key={`rwt-${index}`} position={[2, 2.75, doorZ]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[1.6, 0.5]} /><meshStandardMaterial map={sideWallTexture} roughness={0.9} /></mesh>)
      currentRightZ = holeEnd
    }
  })

  if (currentLeftZ > endZ) {
    const segLen = currentLeftZ - endZ
    leftWalls.push(<mesh key="lw-end" position={[-2, 1.5, currentLeftZ - segLen/2]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[segLen, 3]} /><meshStandardMaterial map={sideWallTexture} roughness={0.9} /></mesh>)
  }
  if (currentRightZ > endZ) {
    const segLen = currentRightZ - endZ
    rightWalls.push(<mesh key="rw-end" position={[2, 1.5, currentRightZ - segLen/2]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[segLen, 3]} /><meshStandardMaterial map={sideWallTexture} roughness={0.9} /></mesh>)
  }

  return (
    <group>
      {/* Sol (Tapis) */}
      <mesh position={[0, 0, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[corridorWidth, length]} />
        <meshStandardMaterial map={carpetTexture} roughness={1} />
      </mesh>

      {/* Plafond */}
      <mesh position={[0, 3, centerZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[corridorWidth, length]} />
        <meshStandardMaterial color="#f0eee9" roughness={0.9} />
      </mesh>

      {/* Murs Latéraux (avec trous) */}
      {leftWalls}
      {rightWalls}
      
      {/* Plinthes */}
      <RoundedBox args={[0.04, 0.3, length]} radius={0.01} smoothness={4} position={[-1.97, 0.15, centerZ]}>
        <meshStandardMaterial color="#2d1c11" roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.04, 0.3, length]} radius={0.01} smoothness={4} position={[1.97, 0.15, centerZ]}>
        <meshStandardMaterial color="#2d1c11" roughness={0.5} />
      </RoundedBox>
      
      {/* Piliers encadrant les portes */}
      {pillarZs.map((z, i) => (
        <group key={`pillar-${i}`} position={[0, 1.5, z]}>
          <RoundedBox args={[0.1, 3, 0.2]} radius={0.02} smoothness={4} position={[-1.95, 0, 0]}>
            <meshStandardMaterial color="#f4f0e6" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[0.1, 3, 0.2]} radius={0.02} smoothness={4} position={[1.95, 0, 0]}>
            <meshStandardMaterial color="#f4f0e6" roughness={0.8} />
          </RoundedBox>
        </group>
      ))}
      
      {/* Appliques Murales et Plafonniers disposés entre les portes */}
      {lampZs.map((z, i) => (
        <group key={`lamps-${i}`} position={[0, 0, z]}>
          <group position={[0, 2.9, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.3]} />
              <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.05]} />
              <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
            </mesh>
            <pointLight position={[0, -0.3, 0]} intensity={0.5} distance={12} color="#ffedcc" />
          </group>

          <group position={[-1.9, 2.0, 0]}>
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#fff4d1" emissive="#fff4d1" emissiveIntensity={1} />
            </mesh>
            <mesh position={[-0.05, -0.1, 0]}>
              <boxGeometry args={[0.05, 0.2, 0.05]} />
              <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.3} />
            </mesh>
            <pointLight intensity={0.3} distance={6} color="#ffedcc" />
          </group>

          <group position={[1.9, 2.0, 0]}>
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#fff4d1" emissive="#fff4d1" emissiveIntensity={1} />
            </mesh>
            <mesh position={[0.05, -0.1, 0]}>
              <boxGeometry args={[0.05, 0.2, 0.05]} />
              <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.3} />
            </mesh>
            <pointLight intensity={0.3} distance={6} color="#ffedcc" />
          </group>
        </group>
      ))}
      
      {/* Mur du fond (avec un trou de 1.6 de large au centre pour l'ascenseur) */}
      <group position={[0, 0, endZ]}>
        {/* Panneau Gauche */}
        <mesh position={[-1.4, 1.5, 0]}>
          <planeGeometry args={[1.2, 3]} />
          <meshStandardMaterial map={endWallTexture} roughness={0.9} />
        </mesh>
        {/* Panneau Droit */}
        <mesh position={[1.4, 1.5, 0]}>
          <planeGeometry args={[1.2, 3]} />
          <meshStandardMaterial map={endWallTexture} roughness={0.9} />
        </mesh>
        {/* Panneau Haut */}
        <mesh position={[0, 2.9, 0]}>
          <planeGeometry args={[1.6, 0.2]} />
          <meshStandardMaterial map={endWallTexture} roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}
