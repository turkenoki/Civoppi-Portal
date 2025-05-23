'use client'
import { createContext, useState, ReactNode } from 'react';

type EditorContextType = {
  color: string;
  side: 'front'|'back'|'left'|'right';
  setCurrentColor: (color: string) => void;
  setCurrentSide:(side:'front'|'back'|'left'|'right') => void;
};

export const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorContextProvider = ({ children }: { children: ReactNode }) => {
  const [color, setCurrentColor] = useState('white');
  const [side, setCurrentSide] = useState<'front'|'back'|'left'|'right'>('front');

  return (
    <EditorContext.Provider value={{ color, side,setCurrentColor, setCurrentSide }}>
      {children}
    </EditorContext.Provider>
  );
};
