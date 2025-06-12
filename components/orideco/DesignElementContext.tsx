'use client';

import React, { createContext, useState, ReactNode } from 'react';

// 共通型 Base
export interface BaseElement {
  id: string;
  type: 'image'|'text';
  position: { x: number; y: number };
  rotate: number;
  size: { width: number; height: number };
  side: 'front' | 'back' | 'left' | 'right';
}

// ImageBean
export interface ImageBean extends BaseElement {
  type: 'image';
  image: string;
  file: File;
}

// TextBean
export interface TextBean extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
}

// 統合型
export type DesignElement = ImageBean | TextBean;

type DesignElementContextType = {
  elements: DesignElement[];
  add: (element: DesignElement) => void;
  remove: (id: string) => void;
  clear: () => void;
  update: (id: string, patch: Partial<DesignElement>) => void;
  find: (id: string) => DesignElement | undefined;
  toFormData: ()=> FormData;
  fromData: (data: {meta: string,images:{[key:string]:File}}) => void;
};

export const DesignElementContext = createContext<DesignElementContextType | undefined>(undefined);

export const DesignElementProvider = ({ children }: { children: ReactNode }) => {
  const [elements, setElements] = useState<DesignElement[]>([]);

  const add = (element: DesignElement) => setElements((prev) => [...prev, element]);
  const remove = (id: string) => setElements((prev) => prev.filter((e) => e.id !== id));
  const clear = () => setElements([]);
  const update = (id: string, patch: Partial<DesignElement>) => {
    setElements((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;

        if (e.type === 'image') {
          return { ...e, ...(patch as Partial<ImageBean>) };
        } else if (e.type === 'text') {
          return { ...e, ...(patch as Partial<TextBean>) };
        } else {
          return e;
        }
      })
    );
  };
  const find = (id: string) => elements.find((e) => e.id === id);
  
  const toFormData = () =>{
    const formData = new FormData();

    formData.append('meta', JSON.stringify(elements)); // ✅ JSON形
    elements.filter((element)=>element.type==='image').forEach((element)=>{
      formData.append(element.id, element.file); // ✅ 実ファイル
    });

    return formData;
  }

  const fromData = (data:{meta: string,images:{[key:string]:File}}) =>{
    const parsed : BaseElement[] = JSON.parse(data.meta);

    parsed.forEach((element)=>{
      if(isTextBean(element)){
        add(element);
        return;        
      }
      if(isImageBean(element)){
        element.file = data.images[element.id];
        element.image = URL.createObjectURL(element.file);
        add(element);
        return;        
      }
      throw new Error("not supported element type has been detected."+ element.type);
    });
  }

  function isImageBean(el: BaseElement): el is ImageBean {
    return el.type === 'image';
  }

  function isTextBean(el: BaseElement): el is TextBean {
    return el.type === 'text';
  }

  return (
    <DesignElementContext.Provider value={{ elements, add, remove, clear, update, find, toFormData,fromData }}>
      {children}
    </DesignElementContext.Provider>
  );
};
