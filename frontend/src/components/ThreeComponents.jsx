import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, PerspectiveCamera, Html } from '@react-three/drei'
import * as THREE from 'three'

// A more detailed Warehouse Box/Crate for IMS
const WarehouseCrate = ({ position, color = "#6366f1" }) => {
  const meshRef = useRef(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.5} 
        roughness={0.2}
      />
      {/* Box Edges/Tape effect using another mesh */}
      <mesh scale={[1.02, 0.1, 1.02]} position={[0, 0.4, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
    </mesh>
  )
}

// Stacked Crates/Inventory Grid for background
export const InventoryGrid = () => {
  return (
    <group position={[0, -2, 0]}>
      {Array.from({ length: 15 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={0.5}>
          <WarehouseCrate 
            position={[
              (Math.random() - 0.5) * 12,
              Math.random() * 8,
              (Math.random() - 0.5) * 10
            ]} 
            color={i % 3 === 0 ? "#6366f1" : i % 3 === 1 ? "#c084fc" : "#818cf8"}
          />
        </Float>
      ))}
    </group>
  )
}

// Main 3D Hero Scene with a focus on an "Inventory Unit"
export const HeroIMS3D = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-60">
      <Canvas shadows camera={{ position: [0, 2, 12], fov: 40 }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />
        
        {/* Central Featured Crate */}
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <group scale={2}>
             <WarehouseCrate position={[0, 0, 0]} color="#6366f1" />
          </group>
        </Float>

        <InventoryGrid />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
