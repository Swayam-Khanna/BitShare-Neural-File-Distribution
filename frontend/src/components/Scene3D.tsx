import { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = () => {
  const count = 3000;
  const mesh = useRef<THREE.Points>(null!);
  const mouse = useRef([0, 0]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouse.current = [
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    ];
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
       temp[i * 3] = (Math.random() - 0.5) * 30;
       temp[i * 3 + 1] = (Math.random() - 0.5) * 30;
       temp[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = time * 0.05 + mouse.current[0] * 0.1;
      mesh.current.rotation.x = time * 0.02 + mouse.current[1] * 0.1;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#6366f1"
        transparent
        opacity={0.3}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Scene3D = () => {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full bg-[#030712]">
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Particles />
      </Canvas>
    </div>
  );
};

export default Scene3D;
