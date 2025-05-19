'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Decal,useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef,useContext } from 'react';
import { ImageContext } from '@/components/ImageContext';

function DebugOverlay() {
  const context = useContext(ImageContext);

  return (
    <div className="absolute top-10 right-2 bg-white/80 text-xs text-black p-2 max-h-[300px] overflow-y-auto shadow-lg rounded">
      <h3 className="font-bold mb-1">🧩 Decal Info</h3>
      {context?.images.map((img) => (
        <div key={img.id} className="mb-2 border-b pb-1">
          <div>ID: {img.id}</div>
          <div>Position: x={img.position.x}, y={img.position.y}</div>
          <div>Size: w={img.size.width}, h={img.size.height}</div>
          <div>Rotate: {img.rotate}</div>
        </div>
      ))}
    </div>
  );
}

export default function TshirtWithDecalFromImages() {
  return (
    <div className="fixed w-screen h-screen">
      <Canvas camera={{ position: [0, 0, 1.5], fov: 40 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <Scene />
      </Canvas>
      <DebugOverlay/>
    </div>
  );
}

function Scene() {
  const context = useContext(ImageContext); // ImageBean[]

  const { scene } = useGLTF('/models/tshirt.glb');
  const meshRef = useRef<THREE.Mesh>(null!);

  // frontメッシュの取得
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name === 'front') {
        meshRef.current = child as THREE.Mesh;
      }
    });
  }, [scene]);

  // 安定順で URL配列を作成
  const imageUrls = context?.images.map(img => img.image ?? '') ?? [];
  const textureMap = useTexture(imageUrls);

  // flipY修正
  Object.values(textureMap).forEach(tex => tex && (tex.flipY = false));
  return (
    <group scale={2.1}>
      <OrbitControls />
      <primitive object={scene} />
      <group position={[0.0005,-0.56,0.05553]} rotation={[Math.PI/2,0,0]} scale={1.05}>

        {context?.images.map((img, index) => {
            const tex = textureMap[index];
            if (!tex || !meshRef.current) return null;


            return (
              <Decal
                key={img.id}
                mesh={meshRef}
                position={[0.00089999*(img.position.x), 0, -0.53 + 0.000905*(img.position.y)]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[0.115 * img.size.width / 128, 0.115 * img.size.height / 128 , 0.3]}
                // position={[-0.03+0.000911*(img.position.x - 474), 0, -0.566+0.000905*(img.position.y - 149)]}
                // rotation={[Math.PI / 2, 0, 0]}
                // scale={[0.115 * img.size.width / 128, 0.115 * img.size.height / 128 , 0.3]}
                map={tex}
                depthTest={false}
                // depthWrite={false}
              />
            );
          })}
      </group>
    </group>
  );
}
