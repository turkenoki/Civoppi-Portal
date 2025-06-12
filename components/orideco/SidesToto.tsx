import * as THREE from 'three';
export interface SideAttributes {
    name:string;
    scale:number;
    offset:{x:number,y:number}
    range:{width:number,height:number}

};

export interface SideAttributes3D {
    position(x:number,y:number):THREE.Vector3;
    rotation(rotate:number):THREE.Euler;
    scale(width:number,height:number):THREE.Vector3;
    meshPosition:THREE.Vector3;
    meshRotation:THREE.Euler;
    meshScale:number;

};


export const sideMap: Record<string, SideAttributes> = {
  front: {name:'前面',scale:1,offset:{x:0,y:70},range:{width: 0.5,height:0.46}},
  back:  {name:'背面',scale:1,offset:{x:0,y:70},range:{width: 0.5,height:0.46}},
};

export const sideMap3D: Record<'front'|'back', SideAttributes3D> = {
  front: {
    position(x, y) {
      return new THREE.Vector3(0.0009 * x, 0, -0.53 + 0.0009 * y);
    },
    rotation(rotate) {
      return new THREE.Euler( Math.PI / 2, 0, (rotate / 180) * Math.PI );
    },
    scale(width, height) {
      return new THREE.Vector3(0.115 * width / 128, 0.115 * height / 128, 5);
    },
    meshPosition: new THREE.Vector3(0,-0.536,0.06),
    meshRotation: new THREE.Euler(Math.PI/2,0,0),
    meshScale: 1,
  },
  back: {
    position(x, y) {
      return new THREE.Vector3(-0.0009 * x, 0, -0.53 + 0.0009 * y);
    },
    rotation(rotate) {
      return new THREE.Euler( Math.PI / 2, Math.PI, (rotate / 180) * Math.PI );
    },
    scale(width, height) {
      return new THREE.Vector3(0.115 * width / 128, 0.115 * height / 128, 1);
    },
    meshPosition: new THREE.Vector3(0,-0.536,0.06),
    meshRotation: new THREE.Euler(Math.PI/2,0,0),
    meshScale: 1,

  },

}