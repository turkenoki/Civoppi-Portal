'use client'
import { useState, useRef, useEffect,useContext } from 'react';
import { ImageContext } from '@/components/ImageContext'

export default function TshirtsEditor() {

  const [resizingId, setResizingId] = useState<number | null>(null);
  const [sizeModel, setSizeModel] = useState({ width: 0, height: 0 });
  const [posCenter, setPosCenter] = useState({ x: 0, y: 0 });
  const [ selectedId,setSelectedId] = useState<number|null>(null);
  const modelRef = useRef<HTMLImageElement>(null);
  const context = useContext(ImageContext);
  // ドラッグ開始時の初期サイズとカーソル位置を記録するためのref
  const initialResizeRef = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);



  useEffect(() => {
    const handleResize = () => setPosCenter({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (modelRef.current) {
      const rect = modelRef.current.getBoundingClientRect();
      setSizeModel({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === 'Delete' )&& selectedId !== null) {
        context?.remove(selectedId);          // 🔥 削除
        setSelectedId(null);
      };
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingId !== null && initialResizeRef.current) {
        const { startX, startY, width, height } = initialResizeRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const newWidth = Math.max(width + deltaX, 50);
        const newHeight = Math.max(height + deltaY, 50);

        context?.update(resizingId, { size: { width: newWidth, height: newHeight } });
      }
    };

    const handleMouseUp = () => {
      setResizingId(null);
      // ドラッグ終了時、初期値をクリアする
      initialResizeRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingId, context]);


  const handleDragStart = (e: React.MouseEvent, id: number) => {
    if (resizingId !== null) return;
    console.log("id"+id);
    const startX = e.clientX;
    const startY = e.clientY;
    const startDecal = context?.find(id)[0];
    if (!startDecal) return;

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      context?.update(id,{position:{x:startDecal.position.x + dx, y:startDecal.position.y + dy}});                     
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setResizingId(id);

    const startDecal = context?.find(id)[0];
    if (!startDecal) return;

    initialResizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      width: startDecal.size.width,
      height: startDecal.size.height,
    };
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const dropX = event.clientX;
    const dropY = event.clientY;
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file); // Blob URL に変換

      context?.add(
        {
          id: context?.images.reduce((max,i)=>Math.max(max,i.id)+1,0),
          image: url,
          position: {x:dropX,y:dropY},
          rotate: 0,
          size:{width: 128, height: 128}
        }
      )
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };


  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver} className="w-screen h-screen bg-white relative">
      <img
        ref={modelRef}
        src="/models/tshirts_front.png"
        className="absolute select-none z-0 w-80 h-80 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        alt="tshirt"
        draggable={false} 
      />

      {context?.images.map((image) => (
        <div
          key={image.id}
          onMouseDown={(e) => handleDragStart(e, image.id)}
          onClick={() => setSelectedId(image.id)}
          className="absolute select-none border border-gray-400 z-50"
          style={{
            left: image.position.x,
            top: image.position.y,
            width: image.size.width,
            height: image.size.height,
            transform: `rotate(${image.rotate ?? 0}deg)`
          }}
        >
          <img
            src={image.image!}
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            alt="decal"
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 z-50 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, image.id)}
          />
        </div>
      ))}

      {sizeModel.width > 0 && (
        <>
          <div
            className="absolute bg-gray-400 z-30 pointer-events-none"
            style={{
              left: posCenter.x,
              top: posCenter.y - (sizeModel.height / 2) * 0.6,
              width: 1,
              height: sizeModel.height * 0.6,
            }}
          />
          <div
            className="absolute bg-gray-400 z-30 pointer-events-none"
            style={{
              top: posCenter.y,
              left: posCenter.x - (sizeModel.width / 2) * 0.4,
              width: sizeModel.width * 0.4,
              height: 1,
            }}
          />
          <div
            className="absolute border border-red-400 z-30 pointer-events-none"
            style={{
              top: posCenter.y - (sizeModel.height / 2) * 0.6,
              left: posCenter.x - (sizeModel.width / 2) * 0.4,
              width: sizeModel.width * 0.4,
              height: sizeModel.height * 0.6,
            }}
          />
        </>
      )}
    </div>
  );
}
