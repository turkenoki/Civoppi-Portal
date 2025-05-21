'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Decal,useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef,useContext } from 'react';
import { DesignElementContext } from '@/components/DesignElementContext';
import { ColorContext} from '@/components/ColorContext';
import { colorMap } from '@/components/Colors'

function DebugOverlay() {
  const context = useContext(DesignElementContext);

  return (
    <div className="absolute top-10 right-2 bg-white/80 text-xs text-black p-2 max-h-[300px] overflow-y-auto shadow-lg rounded">
      <h3 className="font-bold mb-1">🧩 Decal Info</h3>
      {context?.elements.map((elt) => (
        <div key={elt.id} className="mb-2 border-b pb-1">
          <div>ID: {elt.id}</div>
          <div>Position: x={elt.position.x}, y={elt.position.y}</div>
          <div>Size: w={elt.size.width}, h={elt.size.height}</div>
          <div>Rotate: {elt.rotate}</div>
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

function createTextTexture(text: string, options: {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  width?: number;
  height?: number;
}): THREE.Texture {
  const {
    fontSize = 32,
    fontFamily = 'Arial',
    color = 'black',
    width = 256,
    height = 128,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  return texture;
}


function Scene() {
  const context = useContext(DesignElementContext); // ImageBean[]
  const colorContext = useContext(ColorContext);
  const { scene } = useGLTF('/models/tshirt.glb');
  const meshRef = useRef<THREE.Mesh>(null!);

  // frontメッシュの取得
  useMemo(() => {

    scene.traverse((child) => {
      if((child as THREE.Mesh).isMesh){
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        const c = colorContext?.color;
        if(c)
          mat.color.set(colorMap[c]?.color);

      }
      if ((child as THREE.Mesh).isMesh && child.name === 'front') {
        meshRef.current = child as THREE.Mesh;
      }
    });
  }, [scene]);

  // 安定順で URL配列を作成
  const imageUrls = context?.elements.filter(elt=>elt.type==="image").map(elt => elt.image ?? '') ?? [];
  const textureMap = useTexture(imageUrls);

  // flipY修正
  Object.values(textureMap).forEach(tex => tex && (tex.flipY = false));
  return (
    <group scale={2.1}>
      <OrbitControls />
      <primitive object={scene} />
      <group position={[0.0005,-0.56,0.05553]} rotation={[Math.PI/2,0,0]} scale={1.05}>

      {context?.elements.map((element,index) => {
        if (!meshRef.current) return null;

        // imageデカール
        if (element.type === "image") {
          const tex = textureMap[imageUrls.indexOf(element.image ?? '')];
          if (!tex) return null;

          return (
            <Decal
              key={element.id}
              mesh={meshRef}
              position={[0.0009 * element.position.x, 0, -0.53 + 0.0009 * element.position.y]}
              rotation={[Math.PI / 2 , 0 , element.rotate / 180 * Math.PI]}
              scale={[0.115 * element.size.width / 128, 0.115 * element.size.height / 128, 0.3]}
              map={tex}
              renderOrder={index}
              depthTest={false}
            />
          );
        }

        // textデカール
        if (element.type === "text") {
          const textTexture = createTextTexture(element.text, {
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            color: element.color,
            width: element.size.width,
            height: element.size.height,
          });

          return (
            <Decal
              key={element.id}
              renderOrder={index}
              mesh={meshRef}
              position={[0.0009 * element.position.x, 0, -0.53 + 0.0009 * element.position.y]}
              rotation={[Math.PI / 2, 0, element.rotate / 180 * Math.PI]}
              scale={[0.115 * element.size.width / 128, 0.115 * element.size.height / 128, 0.3]}
              map={textTexture}
              depthTest={false}
  
            />
          );
        }

        return null;
      })}

      </group>
    </group>
  );
}
