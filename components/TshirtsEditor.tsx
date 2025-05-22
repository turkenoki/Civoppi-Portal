'use client'

import { useState, useRef, useEffect, useContext } from 'react';
import { DesignElementContext, ImageBean, TextBean } from '@/components/DesignElementContext';
import { ColorContext } from '@/components/ColorContext';
import { v4 as uuidv4 } from 'uuid';
import { colorMap } from '@/components/Colors'

export default function TshirtsEditor() {
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [sizeModel, setSizeModel] = useState({ width: 0, height: 0 });
  const [posCenter, setPosCenter] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentSide, setCurrentSide] = useState<'front' | 'back' | 'left' | 'right'>('front');
  const modelRef = useRef<HTMLImageElement>(null);
  const elementsContext = useContext(DesignElementContext);
  const colorContext = useContext(ColorContext);
  
  const initialResizeRef = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);


  useEffect(() => {
    const handleResize = () => setPosCenter({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleImageLoad = () => {
      if (modelRef.current) {
        const rect = modelRef.current.getBoundingClientRect();
        setSizeModel({ width: rect.width, height: rect.height });
      }
    };
    const img = modelRef.current;
    if (img?.complete) {
      handleImageLoad(); // 画像がすでに読み込まれていたら即時取得
    } else {
      img?.addEventListener('load', handleImageLoad);
    }
    return () => {
      img?.removeEventListener('load', handleImageLoad);
    };
  }, [currentSide, colorContext?.color]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === 'Delete') && selectedId !== null) {
        elementsContext?.remove(selectedId);
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingId !== null && initialResizeRef.current) {
        const found = elementsContext?.find(resizingId);
        if (!found) return;
        const { startX, startY, width, height } = initialResizeRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const newWidth = Math.max(width + deltaX, 30);
        const newHeight = Math.max(height + deltaY, 30);
        const dx = (newWidth - width) / 2;
        const dy = (newHeight - height) / 2;
        elementsContext?.update(resizingId, {
          position: {
            x: found.position.x + dx,
            y: found.position.y + dy,
          },
          size: { width: newWidth, height: newHeight },
        });
      }
    };

    const handleMouseUp = () => {
      setResizingId(null);
      initialResizeRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingId]);

  const handleResizeStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setResizingId(id);
    const startDecal = elementsContext?.find(id);
    if (!startDecal) return;
    initialResizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      width: startDecal.size.width,
      height: startDecal.size.height,
    };
  };

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    if (resizingId !== null) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startDecal = elementsContext?.find(id);
    if (!startDecal) return;
    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      elementsContext?.update(id, {
        position: {
          x: startDecal.position.x + dx,
          y: startDecal.position.y + dy,
        },
      });
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const dropX = event.clientX;
    const dropY = event.clientY;
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      elementsContext?.add({
        id: uuidv4(),
        type: 'image',
        image: url,
        position: { x: dropX - posCenter.x, y: dropY - posCenter.y },
        rotate: 0,
        size: { width: 128, height: 128 },
        side: currentSide,
      } as ImageBean);
    }
  };

  const handleAddText = () => {
    elementsContext?.add({
      id: uuidv4(),
      type: 'text',
      text: 'New Text',
      fontSize: 18,
      fontFamily: 'Arial',
      color: '#000000',
      position: { x: 0, y: 0 },
      rotate: 0,
      size: { width: 100, height: 40 },
      side: currentSide,
    } as TextBean);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver} className="w-screen h-screen bg-white relative">
      <div className="fixed rounded border-1 p-2 top-13 left-3 z-50 flex flex-col w-20 text-[8px]">
        <div className="mt-2 flex flex-col">
          <select
            value={currentSide}
            onChange={(e) => setCurrentSide(e.target.value as 'front'|'back'|'left'|'right')}
            className="border rounded px-2 py-1"
          >
            <option value="front">前面</option>
            <option value="back">背面</option>
            <option value="left">左側</option>
            <option value="right">右側</option>
          </select>
        </div>

        {/* 色選択 */}
        <div className="mt-3 flex flex-col">
          <select
            value={colorContext?.color}
            onChange={(e) => colorContext?.setCurrentColor(e.target.value)}
            className="border rounded px-2 py-1"
          >
          {Object.entries(colorMap).map(([key, value]) => (
            <option key={key} value={key} >
              {value.name}
            </option>
          ))}
          </select>
        </div>

        <button className="mt-3 bg-green-500 text-white px-3 py-1 rounded" onClick={handleAddText}>文字追加</button>
        
        <div className="flex flex-col mt-3">
          {/* rotate スライダー */}
          <label className="font-medium">画像回転</label>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={selectedId?elementsContext?.find(selectedId)?.rotate:0}
            onChange={(e) =>{
              const found =  selectedId?elementsContext?.find(selectedId):null;
              if(found) {
                elementsContext?.update(found.id, {
                  rotate: parseInt(e.target.value),
                });
              }
            }}
            className="mb-2"
          />
        </div>
      </div>


      {selectedId && elementsContext?.find(selectedId)?.type === "text" && (
        <div className="fixed top-13 right-4 bg-white border shadow-md p-4 z-50 rounded w-40">
          <h2 className="text-sm font-bold mb-2">文字編集</h2>

          {/* テキスト入力 */}
          <input
            type="text"
            value={(elementsContext?.find(selectedId) as TextBean).text}
            onChange={(e) =>
              elementsContext?.update(selectedId!, { text: e.target.value })
            }
            className="w-full border rounded px-2 py-1 mb-2 text-sm"
          />

          {/* フォントサイズ */}
          <label className="text-xs font-medium">Font Size</label>
          <input
            type="range"
            min={8}
            max={72}
            step={1}
            value={(elementsContext?.find(selectedId) as TextBean).fontSize}
            onChange={(e) =>
              elementsContext?.update(selectedId!, { fontSize: parseInt(e.target.value) })
            }
            className="w-full mb-2"
          />

          {/* フォントファミリー */}
          <label className="text-xs font-medium">Font Family</label>
          <select
            value={(elementsContext?.find(selectedId) as TextBean).fontFamily}
            onChange={(e) =>
              elementsContext?.update(selectedId!, { fontFamily: e.target.value })
            }
            className="w-full border rounded px-2 py-1 mb-2 text-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Courier New">Courier New</option>
            <option value="Comic Sans MS">Comic Sans</option>
            <option value="Impact">Impact</option>
          </select>

          {/* 色 */}
          <label className="text-xs font-medium">色</label>
          <input
            type="color"
            value={(elementsContext?.find(selectedId) as TextBean).color}
            onChange={(e) =>
              elementsContext?.update(selectedId!, { color: e.target.value })
            }
            className="w-full mb-2"
          />
        </div>
      )}
      
      {/*  Tシャツモデル */}
      <img
        src={`/models/tshirts_${currentSide}_${colorContext?.color}.png`}
        ref={modelRef}
        width='320px'
        height='320px'
        className="absolute select-none z-0 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        alt="tshirt"
        draggable={false}
      />


      <div
        // style={{
        //   position: 'absolute',
        //   top: posCenter.y - (sizeModel.height / 2) * 0.6,
        //   left: posCenter.x - (sizeModel.width / 2) * 0.4,
        //   width: sizeModel.width * 0.4,
        //   height: sizeModel.height * 0.6,
        //   overflow: 'hidden',
        //   zIndex: 10,
        // }}
      >
        {elementsContext?.elements.filter((elt) => elt.side === currentSide).map((element) => (
          <div
            key={element.id}
            onMouseDown={(e) => handleDragStart(e, element.id)}
            onClick={() => setSelectedId(element.id)}
            className="absolute select-none border border-gray-400 z-10"
            style={{
              left: posCenter.x + element.position.x - element.size.width / 2,
              top: posCenter.y + element.position.y - element.size.height / 2,
              width: element.size.width,
              height: element.size.height,
              transform: `rotate(${element.rotate ?? 0}deg)`,
            }}
          >
            {element.type === 'image' && (
              <img
                src={element.image!}
                className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                alt="decal"
              />
            )}
            {element.type === 'text' && (
              element.id === selectedId ? (
                <div 
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full h-full text-center outline-none"
                  style={{
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    color: element.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  onBlur={(e) => elementsContext?.update(element.id, { text: e.currentTarget.innerText })}
                  autoFocus
                >
                  {(element as TextBean).text}
                </div>
              ) : (
                <div
                  className="absolute text-center inset-0 w-full h-full z-0 flex items-center justify-center text-center pointer-events-none"
                  style={{
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    color: element.color,
                    whiteSpace: 'nowrap', // ← 追加
                    overflow: 'hidden',   // ← はみ出た部分を見切る
                    textOverflow: 'clip',  // ← 省略記号なしで見切る
                    textAlign: 'center',
                  }}
                >
                  {(element as TextBean).text}
                </div>
              )
            )}
            <div
              className="absolute bottom-0 right-0 w-1 h-1 z-50 cursor-se-resize"
              onMouseDown={(e) => handleResizeStart(e, element.id)}
            />
          </div>
        ))}
      </div>
 

      {sizeModel.width > 0 && (
        <>
          {/* // 描画範囲 */}
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
