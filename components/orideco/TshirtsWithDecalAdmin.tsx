'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Decal,useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef,useContext,useState,useEffect } from 'react';
import { DesignElementContext } from '@/components/orideco/DesignElementContext';
import { EditorContext} from '@/components/orideco/EditorContext';
import { colorMap } from '@/components/orideco/Colors'
import CameraLight from '@/components/orideco/CameraLight'
import { sideMap3D } from './Sides';
import JSZip from 'jszip';

export function SnapshotList() {
  const [folders, setFolders] = useState<string[]>([]);
  const [isDownloading,setIsDownLoading] = useState<boolean>(false);
  const [toggleDeleted,setToggleDeleted] = useState<boolean>(false);
  const context = useContext(DesignElementContext);


  useEffect(() => {
    fetch('/serverside/snapshots')
      .then((res) => res.json())
      .then((data) => setFolders(data.folders));
  }, [toggleDeleted]);

  const handleFile = async (folder : string) => {
    if(isDownloading){
      return;
    }
    setIsDownLoading(true);
    try{
      context?.clear();
      const res = await fetch(`/serverside/snapshots/${folder}`);
      if(!res.ok){
        throw new Error('Server error on downloading '+folder);
      }
      const blob = await res.blob(); // ✅ ZIPとして取得
      const zip = await JSZip.loadAsync(blob);
  
      // ✅ meta.jsonを読み込む
      const metaFile = zip.file('meta.json');
      if (!metaFile) {
        throw new Error('meta.json does not exists.');
      }

      const metaText = await metaFile.async('string');
  
      // ✅ 画像ファイル群を読み込む
      const imgList : {[key: string]:File} = {};

      for (const filename in zip.files) {
        if (filename === 'meta.json') continue;

        const entry = zip.files[filename];
        if (entry.dir) continue;
        const blob = await entry.async('blob');
        imgList[filename.split('.').shift()??filename] = new File([blob],filename,{type: blob.type});
      }
      context?.fromData({meta: metaText, images: imgList})
      alert("読み込みました。")
    }finally{
      setIsDownLoading(false);
    }
  };

  const handleDelete = async (folder : string) => {
    const res = await fetch(`/serverside/delete/${folder}`);
    console.log(res);
    setToggleDeleted((prev)=>!prev);
  };

  const handleDownload = (folder:string)=>{
      const a = document.createElement('a');
    a.href = `/serverside/snapshots/${folder}`;
    a.download = `${folder}.zip`;
    a.click();
  }



  return (
    <div className="absolute pointer-events-auto z-100 top-10 left-2 bg-white/80 text-xs text-black p-2 max-h-[300px] overflow-y-auto shadow-lg rounded">
      <h2 className="text-xl font-bold">保存済みスナップショット</h2>
        <ul>
          {folders.map((folder) => (
            <li
              key={folder}
              className="cursor-pointer text-blue-600 hover:underline text-sm flex flex-row"
              >
              <div onClick={()=>handleFile(folder)}>{folder}</div>
              <div onClick={()=>handleDownload(folder)}>⬇️</div>
              <div onClick={()=>{
                const ok = window.confirm(`📛 このスナップショット「${folder}」を削除してもよいですか？`);
                if (ok) {
                  handleDelete(folder);
                }                
              }}>🗑️</div>
              
            </li>
          ))}
        </ul>
    </div>
  );
}

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
      <SnapshotList/>
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
  const colorContext = useContext(EditorContext);
  const { scene } = useGLTF('/models/tshirt.glb');
  // コンポーネント内で定義
  const meshRefs:Record<'front'|'back'|'left'|'right', React.RefObject<THREE.Mesh>> = {
    front: useRef<THREE.Mesh>(null!),
    back: useRef<THREE.Mesh>(null!),
    left: useRef<THREE.Mesh>(null!),
    right: useRef<THREE.Mesh>(null!),
  };

  // frontメッシュの取得
  useMemo(() => {

    scene.traverse((child) => {
      if((child as THREE.Mesh).isMesh){
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        const c = colorContext?.color;
        if(c)
          mat.color.set(colorMap[c]?.color);

      }
      console.log("meshes",child.name,(child as THREE.Mesh).isMesh,":",child.type)
      if ((child as THREE.Mesh).isMesh && Object.prototype.hasOwnProperty.call(meshRefs, child.name)) {
          console.log("child name is "+child.name + "/"+child.type)
          meshRefs[child.name as keyof typeof meshRefs].current = child as THREE.Mesh;

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
      <CameraLight/>
      <OrbitControls />
      <primitive object={scene} />
      <group>

        {context?.elements.map((element,index) => {
          if (!meshRefs[element.side]?.current) return null;

          // imageデカール
          if (element.type === "image") {
            const tex = textureMap[imageUrls.indexOf(element.image ?? '')];
            if (!tex) return null;

            return (
              <group key={element.id} position={sideMap3D[element.side].meshPosition} rotation={sideMap3D[element.side].meshRotation} scale={sideMap3D[element.side].meshScale}>
                <Decal
                  key={element.id}
                  mesh={meshRefs[element.side]}
                  position= {sideMap3D[element.side].position(element.position.x, element.position.y)}
                  rotation={sideMap3D[element.side].rotation(element.rotate)}
                  scale={sideMap3D[element.side].scale(element.size.width,element.size.height)}
                  map={tex}
                  renderOrder={index}
                  depthTest={false}
                  polygonOffsetFactor={-150}
                />
              </group>

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
              <group key={element.id} position={sideMap3D[element.side].meshPosition} rotation={sideMap3D[element.side].meshRotation} scale={sideMap3D[element.side].meshScale}>
                <Decal
                  key={element.id}
                  renderOrder={index}
                  mesh={meshRefs[element.side]}
                  position= {sideMap3D[element.side].position(element.position.x, element.position.y)}
                  rotation={sideMap3D[element.side].rotation(element.rotate)}
                  scale={sideMap3D[element.side].scale(element.size.width,element.size.height)}
                  // position={new THREE.Vector3(0.0009 * element.position.x, 0, -0.53 + 0.0009 * element.position.y)}
                  // rotation={new THREE.Euler(Math.PI / 2 , Math.PI , element.rotate / 180 * Math.PI)}
                  // scale={new THREE.Vector3(0.115 * element.size.width / 128, 0.115 * element.size.height / 128, 0.3)}
                  map={textTexture}
                  depthTest
                  polygonOffsetFactor={-150}
      
                />
              </group>
            );
          }

          return null;
        })}

      </group>
    </group>
  );
}
