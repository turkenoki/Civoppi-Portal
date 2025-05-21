'use client';

import React, { createContext, useState, ReactNode } from 'react';

// 共通型 Base
interface BaseElement {
  id: string;
  position: { x: number; y: number };
  rotate: number;
  size: { width: number; height: number };
  side: 'front' | 'back' | 'left' | 'right';
}

// ImageBean
export interface ImageBean extends BaseElement {
  type: 'image';
  image: string | null;
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

  return (
    <DesignElementContext.Provider value={{ elements, add, remove, clear, update, find }}>
      {children}
    </DesignElementContext.Provider>
  );
};
