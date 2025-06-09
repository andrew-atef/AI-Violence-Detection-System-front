import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere } from '@react-three/drei';

function Camera3D() {
  const modelRef = useRef();

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <group ref={modelRef} scale={[2, 2, 2]} rotation={[0, Math.PI * 0.25, 0]}>
      {/* Camera body */}
      <Box args={[1, 1.5, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
      </Box>
      
      {/* Lens */}
      <Cylinder args={[0.4, 0.4, 0.6, 32]} position={[0, 0.8, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#e0e0e0" metalness={0.8} roughness={0.1} />
      </Cylinder>
      
      {/* Lens detail */}
      <Sphere args={[0.25, 32, 32]} position={[0, 0.8, -0.7]}>
        <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
      </Sphere>

      {/* Mount base */}
      <Box args={[1.2, 0.2, 0.9]} position={[0, -0.85, 0]}>
        <meshStandardMaterial color="#f0f0f0" metalness={0.7} roughness={0.2} />
      </Box>
    </group>
  );
}

export default Camera3D;