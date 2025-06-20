'use client'

import { useState, useRef, useEffect, useContext } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import { DesignElementContext, ImageBean, TextBean, BaseElement } from '@/components/orideco/DesignElementContext';
import { EditorContext } from '@/components/orideco/EditorContext';
import { v4 as uuidv4 } from 'uuid';
import { colorMap } from '@/components/orideco/Colors'
import { sides } from '@/components/orideco/Sides'

export default function ItemEditor({ item }: { item: 'tshirt' | 'toto' }) {
  const [currentItem, setCurrentItem] = useState<'tshirt' | 'toto'>(item);
  const sideMap = sides[currentItem].sideMap;
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [sizeModel, setSizeModel] = useState({ width: 0, height: 0 });
  const [posCenter, setPosCenter] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const modelRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const elementsContext = useContext(DesignElementContext);
  const editorContext = useContext(EditorContext);

  const initialResizeRef = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);

  // Touch gesture refs
  const dragTouchRef = useRef<{ id: string; startX: number; startY: number; posX: number; posY: number } | null>(null);
  const pinchTouchRef = useRef<{ id: string; startDistance: number; startWidth: number; startHeight: number; posX: number; posY: number } | null>(null);

  useEffect(() => {
    const handleResize = () => setPosCenter({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const spacingPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spacing'));
    console.log("spacingPx:"+spacingPx);
    const r = document.body.getBoundingClientRect();
    console.log('body width =', r.width ,"height",r.height);

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
  }, [editorContext]);

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
        const deltaX = (e.clientX - startX)/ 1.75;
        const deltaY = (e.clientY - startY)/ 1.75;
        const newWidth = Math.max(width + deltaX, 30);
        const newHeight = Math.max(height + deltaY, 30);
        const dx = (newWidth - width) / 2;
        const dy = (newHeight - height) / 2;
        elementsContext?.update(resizingId, {
          position: {
            x: found.position.x + dx,
            y: found.position.y + dy,
          },
          size: { width: newWidth , height: newHeight },
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

  useEffect(() => {
    const getDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (pinchTouchRef.current && e.touches.length >= 2) {
        const { id, startDistance, startWidth, startHeight, posX, posY } = pinchTouchRef.current;
        const dist = getDistance(e.touches);
        const scale = dist / startDistance;
        const newWidth = Math.max(startWidth * scale, 30);
        const newHeight = Math.max(startHeight * scale, 30);
        const dx = (newWidth - startWidth) / 2;
        const dy = (newHeight - startHeight) / 2;
        elementsContext?.update(id, {
          position: { x: posX + dx, y: posY + dy },
          size: { width: newWidth, height: newHeight },
        });
        e.preventDefault();
        return;
      }

      if (dragTouchRef.current && e.touches.length === 1) {
        const touch = e.touches[0];
        const { id, startX, startY, posX, posY } = dragTouchRef.current;
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        elementsContext?.update(id, {
          position: { x: posX + dx, y: posY + dy },
        });
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchTouchRef.current = null;
      }
      if (e.touches.length === 0) {
        dragTouchRef.current = null;
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

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

  const handleTouchStartElement = (e: React.TouchEvent, id: string) => {
    e.preventDefault();
    setSelectedId(id);
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const found = elementsContext?.find(id);
      if (!found) return;
      dragTouchRef.current = {
        id,
        startX: touch.clientX,
        startY: touch.clientY,
        posX: found.position.x,
        posY: found.position.y,
      };
      pinchTouchRef.current = null;
    }
    if (e.touches.length === 2) {
      const found = elementsContext?.find(id);
      if (!found) return;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      pinchTouchRef.current = {
        id,
        startDistance: distance,
        startWidth: found.size.width,
        startHeight: found.size.height,
        posX: found.position.x,
        posY: found.position.y,
      };
      dragTouchRef.current = null;
    }
  };

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    if (resizingId !== null) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startDecal = elementsContext?.find(id);
    if (!startDecal) return;
    const handleMouseMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / 1.75;
      const dy = (ev.clientY - startY) / 1.75;
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
        item: currentItem,
        type: 'image',
        image: url,
        file: file,
        position: { x: dropX - posCenter.x, y: dropY - posCenter.y },
        rotate: 0,
        size: { width: 128   , height: 128 },
        side: editorContext?.side,
      } as ImageBean);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      elementsContext?.add({
        id: uuidv4(),
        item: currentItem,
        type: 'image',
        image: url,
        file: file,
        position: { x: 0, y: 0 },
        rotate: 0,
        size: { width: 128, height: 128 },
        side: editorContext?.side,
      } as ImageBean);
    }
    event.target.value = '';
  };

  const handleAddText = () => {
    elementsContext?.add({
      id: uuidv4(),
      item: currentItem,
      type: 'text',
      text: 'New Text',
      fontSize: 18,
      fontFamily: 'Arial',
      color: '#000000',
      position: { x: 0, y: 0 },
      rotate: 0,
      size: { width: 100 , height:  40 },
      side: editorContext?.side,
    } as TextBean);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const zip = new JSZip();
      zip.file('meta.json', JSON.stringify(elementsContext?.elements ?? [], null, 2));

      const promises = (elementsContext?.elements ?? []).map(async (el) => {
        if (el.type !== 'image') return;
        const buffer = await el.file.arrayBuffer();
        const ext = el.file.name.split('.').pop() ?? 'bin';
        zip.file(`${el.id}.${ext}`, buffer);
      });
      await Promise.all(promises);

      const blob = await zip.generateAsync({ type: 'blob' });
      const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ts}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsSaving(false);
    }
  };

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const zip = await JSZip.loadAsync(file);
      const metaFile = zip.file('meta.json');
      if (!metaFile) throw new Error('meta.json does not exists.');
      const metaText = await metaFile.async('string');
      const parsed: BaseElement[] = JSON.parse(metaText);
      const uploadedItem = parsed[0]?.item as 'tshirt' | 'toto' | undefined;
      const imgList: { [key: string]: File } = {};
      for (const filename in zip.files) {
        if (filename === 'meta.json') continue;
        const entry = zip.files[filename];
        if (entry.dir) continue;
        const blob = await entry.async('blob');
        imgList[filename.split('.').shift() ?? filename] = new File([blob], filename, { type: blob.type });
      }
      elementsContext?.clear();
      elementsContext?.fromData({ meta: metaText, images: imgList });
      if(uploadedItem && uploadedItem !== currentItem){
        setCurrentItem(uploadedItem);
      }
      alert('読み込みました。');
    } finally {
      event.target.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <>
    <div onDrop={handleDrop} onDragOver={handleDragOver} className="w-screen h-screen bg-white relative">
      <div className="fixed rounded border-1 p-2 top-25 left-3 z-50 flex flex-col w-30 text-sm">
        {/* 編集面 */}
        <div className="mt-2 flex flex-col">
          <select
            value={editorContext?.side}
            onChange={(e) => editorContext?.setCurrentSide(e.target.value as 'front'|'back'|'right'|'left')}
            className="border rounded px-2 py-1"
          >
          {Object.entries(sideMap).map(([key, value]) => (
            <option key={key} value={key} >
              {value.name}
            </option>
          ))}
          </select>
        </div>

        {/* 色選択 */}
        <div className="mt-3 flex flex-col">
          <select
            value={editorContext?.color}
            onChange={(e) => editorContext?.setCurrentColor(e.target.value)}
            className="border rounded px-2 py-1"
          >
          {Object.entries(colorMap).map(([key, value]) => (
            <option key={key} value={key} >
              {value.name}
            </option>
          ))}
          </select>
        </div>

        {/* 文字挿入 */}
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

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          className="mt-3 bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => fileInputRef.current?.click()}
        >画像追加</button>

        {sides[currentItem].sideMap3D ? (
          <Link
            href="/orideco/editor/sim3DDesign"
            className="mt-3 bg-purple-500 text-white px-3 py-1 rounded block text-center"
          >
            デザイン確認
          </Link>
        ) : (
          <span
            className="mt-3 bg-gray-300 text-gray-500 px-3 py-1 rounded block text-center cursor-not-allowed"
          >
            デザイン確認
          </span>
        )}

        <input
          type="file"
          accept="application/zip"
          ref={zipInputRef}
          className="hidden"
          onChange={handleZipUpload}
        />
        <button
          className="mt-3 bg-yellow-500 text-white px-3 py-1 rounded"
          onClick={() => zipInputRef.current?.click()}
        >取り込み</button>

        <button className="mt-3 bg-red-400 text-white px-3 py-1 rounded" onClick={handleSave}>保存</button>

      </div>


      {selectedId && elementsContext?.find(selectedId)?.type === "text" && (
        <div className="fixed top-25 left-40 border-1 shadow-md p-4 z-50 rounded w-30">
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

      {/*  Itemモデル */}
      {editorContext && (
        <img
          src={`/models/${currentItem}_${editorContext?.side}_${editorContext?.color}.png`}
          ref={modelRef}
          width= {560*sideMap[editorContext.side].scale}
          height={560*sideMap[editorContext.side].scale}
          className="absolute select-none z-0 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          alt="item"
          draggable={false}
        />
      )}

      <div
      >
        {elementsContext?.elements.filter((elt) => elt.side === editorContext?.side).map((element) => (
          <div
            key={element.id}
            onMouseDown={(e) => handleDragStart(e, element.id)}
            onTouchStart={(e) => handleTouchStartElement(e, element.id)}
            onClick={() => setSelectedId(element.id)}
            className="absolute select-none border border-gray-400 z-10  cursor-move"
            style={{
              left: posCenter.x + element.position.x * 1.75 - element.size.width * 1.75  / 2,
              top: posCenter.y + element.position.y * 1.75 - element.size.height * 1.75 / 2,
              width: element.size.width * 1.75 ,
              height: element.size.height * 1.75,
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
                    fontSize: element.fontSize * 1.75,
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
                    fontSize: element.fontSize * 1.75,
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
              className="absolute bottom-0 right-0 w-2 h-2 z-50 cursor-se-resize"
              onMouseDown={(e) => handleResizeStart(e, element.id)}
            />
          </div>
        ))}
      </div>


      {sizeModel.width > 0 && editorContext &&(
        <>
          {/* // 描画範囲 */}
          <div
            className="absolute bg-gray-400 z-30 pointer-events-none"
            style={{
              left: posCenter.x + sideMap[editorContext.side].offset.x,
              top: posCenter.y + sideMap[editorContext.side].offset.y - (sizeModel.height / 2) * sideMap[editorContext.side].range.height,
              width: 1,
              height: sizeModel.height * sideMap[editorContext.side].range.height,
            }}
          />
          <div
            className="absolute bg-gray-400 z-30 pointer-events-none"
            style={{
              top: posCenter.y + sideMap[editorContext.side].offset.y,
              left: posCenter.x + sideMap[editorContext.side].offset.x - (sizeModel.width / 2) * sideMap[editorContext.side].range.width,
              width: sizeModel.width * sideMap[editorContext.side].range.width,
              height: 1,
            }}
          />
          <div
            className="absolute border border-red-400 z-30 pointer-events-none"
            style={{
              top: posCenter.y + sideMap[editorContext.side].offset.y - (sizeModel.height / 2) * sideMap[editorContext.side].range.height,
              left: posCenter.x + sideMap[editorContext.side].offset.x - (sizeModel.width / 2) * sideMap[editorContext.side].range.width,
              width: sizeModel.width * sideMap[editorContext.side].range.width,
              height: sizeModel.height * sideMap[editorContext.side].range.height,
            }}
          />
        </>
      )}
    </div>
    </>
  );
}

