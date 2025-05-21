'use client'
import { createContext, useState, ReactNode } from 'react';

type ColorContextType = {
  color: string;
  setCurrentColor: (color: string) => void;
};

export const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const ColorContextProvider = ({ children }: { children: ReactNode }) => {
  const [color, setCurrentColor] = useState('white');

  return (
    <ColorContext.Provider value={{ color, setCurrentColor }}>
      {children}
    </ColorContext.Provider>
  );
};
