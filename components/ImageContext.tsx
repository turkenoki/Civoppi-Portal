'use client';

import React, { createContext, useState, ReactNode} from 'react';

export type ImageBean = {
  id: number;
  image: string|null;
  position: {x:number,y:number}; // 2Dでのcenterからのtop,left位置
  rotate:number;
  size: {width:number,height:number}
}

type ImageContextType = {
  images: ImageBean[];
  add:(image:ImageBean) => void;
  remove:(id:number)=>void;
  clear:()=>void;
  update:(id:number, patch: Partial<ImageBean>)=>void;
  find:(id:number)=>ImageBean[];
};


export const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider = ({ children }: { children: ReactNode }) => {
  const [images, setImageBeans] = useState<ImageBean[]>([]);

  const add = (image:ImageBean)=>setImageBeans((prev)=>[...prev,image]);
  const remove = (id:number)=>setImageBeans((prev)=> prev.filter((i)=>i.id !== id))
  const clear = ()=> setImageBeans([]);
  const update = (id:number, patch: Partial<ImageBean>)=>setImageBeans((prev)=>prev.map((i)=>i.id === id?
    {...i,...patch}:i));
  const find = (id:number)=>images.filter((i)=>i.id === id);
  return (
    <ImageContext.Provider value={{ images,add,remove,clear,update,find}}>
      {children}
    </ImageContext.Provider>
  );
};

