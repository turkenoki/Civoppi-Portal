import * as THREE from 'three';

export interface SideAttributes {
  name: string;
  scale: number;
  offset: { x: number; y: number };
  range: { width: number; height: number };
}

export interface SideAttributes3D {
  position(x: number, y: number): THREE.Vector3;
  rotation(rotate: number): THREE.Euler;
  scale(width: number, height: number): THREE.Vector3;
  meshPosition: THREE.Vector3;
  meshRotation: THREE.Euler;
  meshScale: number;
}

// -- tshirt --------------------------------------------------------------
const tshirtSideMap: Record<string, SideAttributes> = {
  front: { name: '前面', scale: 1, offset: { x: 0, y: 0 }, range: { width: 0.4, height: 0.6 } },
  back: { name: '背面', scale: 1, offset: { x: 0, y: 0 }, range: { width: 0.4, height: 0.7 } },
  right: { name: '右側', scale: 1, offset: { x: 0, y: -35 }, range: { width: 0.5, height: 0.55 } },
  left: { name: '左側', scale: 1, offset: { x: 0, y: -35 }, range: { width: 0.5, height: 0.55 } },
};

const tshirtSideMap3D: Record<'front' | 'back' | 'left' | 'right', SideAttributes3D> = {
  front: {
    position(x, y) {
      return new THREE.Vector3(0.0009 * x, 0, -0.53 + 0.0009 * y);
    },
    rotation(rotate) {
      return new THREE.Euler(Math.PI / 2, 0, (rotate / 180) * Math.PI);
    },
    scale(width, height) {
      return new THREE.Vector3(0.115 * width / 128, 0.115 * height / 128, 5);
    },
    meshPosition: new THREE.Vector3(0, -0.536, 0.06),
    meshRotation: new THREE.Euler(Math.PI / 2, 0, 0),
    meshScale: 1,
  },
  back: {
    position(x, y) {
      return new THREE.Vector3(-0.0009 * x, 0, -0.53 + 0.0009 * y);
    },
    rotation(rotate) {
      return new THREE.Euler(Math.PI / 2, Math.PI, (rotate / 180) * Math.PI);
    },
    scale(width, height) {
      return new THREE.Vector3(0.115 * width / 128, 0.115 * height / 128, 1);
    },
    meshPosition: new THREE.Vector3(0, -0.536, 0.06),
    meshRotation: new THREE.Euler(Math.PI / 2, 0, 0),
    meshScale: 1,
  },
  right: {
    position(x, y) {
      return new THREE.Vector3(1, x * 0.00011 - 0.014, y * 0.00011055 - 0.597);
    },
    rotation(rotate) {
      return new THREE.Euler(Math.PI / 2, Math.PI / 2, -(rotate / 180) * Math.PI);
    },
    scale(width, height) {
      return new THREE.Vector3(width * 0.00011, height * 0.00011, 3);
    },
    meshPosition: new THREE.Vector3(0.004, -0.55, 0.06),
    meshRotation: new THREE.Euler(Math.PI / 2, 0, 0),
    meshScale: 1,
  },
  left: {
    position(x, y) {
      return new THREE.Vector3(1, x * -0.000112 - 0.01, y * 0.0001105 - 0.597);
    },
    rotation(rotate) {
      return new THREE.Euler(Math.PI / 2, Math.PI / 2, -(rotate / 180) * Math.PI);
    },
    scale(width, height) {
      return new THREE.Vector3(width * 0.00011, height * 0.00011, 3);
    },
    meshPosition: new THREE.Vector3(0.004, -0.55, 0.06),
    meshRotation: new THREE.Euler(Math.PI / 2, 0, 0),
    meshScale: 1,
  },
};

// -- toto (totobag) ------------------------------------------------------
const totoSideMap: Record<string, SideAttributes> = {
  front: { name: '前面', scale: 1, offset: { x: 0, y: 70 }, range: { width: 0.5, height: 0.46 } },
  back: { name: '背面', scale: 1, offset: { x: 0, y: 70 }, range: { width: 0.5, height: 0.46 } },
};

const totoSideMap3D: Record<'front' | 'back', SideAttributes3D> = {
  front: {
    position(x, y) {
      return new THREE.Vector3(0.0009 * x, 0, -0.53 + 0.0009 * y);
    },
    rotation(rotate) {
      return new THREE.Euler(Math.PI / 2, 0, (rotate / 180) * Math.PI);
    },
    scale(width, height) {
      return new THREE.Vector3(0.115 * width / 128, 0.115 * height / 128, 5);
    },
    meshPosition: new THREE.Vector3(0, -0.536, 0.06),
    meshRotation: new THREE.Euler(Math.PI / 2, 0, 0),
    meshScale: 1,
  },
  back: {
    position(x, y) {
      return new THREE.Vector3(-0.0009 * x, 0, -0.53 + 0.0009 * y);
    },
    rotation(rotate) {
      return new THREE.Euler(Math.PI / 2, Math.PI, (rotate / 180) * Math.PI);
    },
    scale(width, height) {
      return new THREE.Vector3(0.115 * width / 128, 0.115 * height / 128, 1);
    },
    meshPosition: new THREE.Vector3(0, -0.536, 0.06),
    meshRotation: new THREE.Euler(Math.PI / 2, 0, 0),
    meshScale: 1,
  },
};

// ------------------------------------------------------------------------
export const sides = {
  tshirt: {
    sideMap: tshirtSideMap,
    sideMap3D: tshirtSideMap3D,
  },
  toto: {
    sideMap: totoSideMap,
    sideMap3D: totoSideMap3D,
  },
};

// Backward compatibility exports for Tshirt components
export const sideMap = sides.tshirt.sideMap;
export const sideMap3D = sides.tshirt.sideMap3D;
