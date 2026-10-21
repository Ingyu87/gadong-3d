import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// part list per type: [matName, geometry]
const B=(w,h,d,x,y,z)=>{const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);return g;};
const C=(r,h,x,y,z,rx=0,rz=0,seg=8)=>{const g=new THREE.CylinderGeometry(r,r,h,seg);if(rx)g.rotateX(rx);if(rz)g.rotateZ(rz);g.translate(x,y,z);return g;};
const P=(w,h,x,y,z,ry=0,rx=0)=>{const g=new THREE.PlaneGeometry(w,h);if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);g.translate(x,y,z);return g;};
function chairParts(cx){const L=[];
 L.push(['lime',B(0.38,0.022,0.38,cx,0.43,0)]);L.push(['lime',B(0.018,0.26,0.36,cx+0.2,0.68,0)]);
 for(const dz of[-0.16,0.16]){L.push(['frameG',C(0.011,0.43,cx-0.15,0.215,dz)]);L.push(['frameG',C(0.011,0.80,cx+0.17,0.40,dz)]);L.push(['frameG',C(0.01,0.34,cx,0.03,dz,0,Math.PI/2)]);}
 return L;}
const LIB={
 desk:()=>{const L=[['deskTop',B(0.45,0.022,0.64,0,0.72,0)],['frameG',B(0.46,0.04,0.66,0,0.69,0)]];
  for(const dz of[-0.28,0.28]){L.push(['frameG',C(0.016,0.68,0,0.34,dz)]);L.push(['frameG',B(0.46,0.025,0.035,0,0.012,dz)]);}L.push(['frameG',B(0.02,0.25,0.56,0.18,0.55,0)]);
  return L.concat(chairParts(0.5));},
 chair:()=>chairParts(0),
 tdesk:()=>[['deskTop',B(0.7,0.03,1.3,0,0.74,0)],['frameG',B(0.68,0.7,0.03,0,0.36,-0.63)],['frameG',B(0.68,0.7,0.03,0,0.36,0.63)],['frameG',B(0.02,0.5,1.25,-0.33,0.45,0)]],
 front:()=>{const L=[];L.push(['woodLight',B(0.45,0.85,6.6,0.225,0.425,0)]);L.push(['woodLight',B(0.04,1.7,6.6,0.02,1.7,0)]);L.push(['woodLight',B(0.3,0.07,6.6,0.15,2.6,0)]);
  L.push(['tv',B(0.06,1.1,1.95,0.07,1.6,0)]);L.push(['board',P(1.55,1.05,0.065,1.6,-1.95,Math.PI/2)]);L.push(['board',P(1.55,1.05,0.065,1.6,1.95,Math.PI/2)]);L.push(['flag',P(0.6,0.4,0.065,2.35,0,Math.PI/2)]);
  for(let z=-3.0;z<3.2;z+=0.6)L.push(['metal',B(0.01,0.75,0.02,0.455,0.45,z)]);return L;},
 led:()=>[['led',P(1.3,0.28,0,-0.005,0,0,Math.PI/2)],['white',B(0.3,0.02,1.34,0,0.005,0)]],
 ac:()=>[['white',B(0.9,0.06,0.9,0,0.03,0)],['metal',B(0.6,0.005,0.6,0,-0.002,0)]],
 fan:()=>[['white',B(0.08,0.2,0.12,0.04,2.35,0)],['white',C(0.24,0.1,0.22,2.35,0,0,Math.PI/2,20)]],
 shelf:()=>[['woodLight',B(0.35,1.2,1.2,-0.175,0.6,0)],['door',B(0.36,0.02,1.18,-0.175,0.4,0)],['door',B(0.36,0.02,1.18,-0.175,0.8,0)]],
 cabinet:()=>[['woodLight',B(0.5,2.0,0.9,-0.25,1.0,0)]],
 shelf2:()=>[['woodLight',B(0.4,2.0,1.5,0,1.0,0)],['door',B(0.41,0.02,1.46,0,0.5,0)],['door',B(0.41,0.02,1.46,0,1.0,0)],['door',B(0.41,0.02,1.46,0,1.5,0)]],
 rtable:()=>{const L=[['deskTop',C(0.6,0.03,0,0.72,0,0,0,24)],['frameG',C(0.04,0.7,0,0.35,0)]];for(let k=0;k<4;k++){const a=k*Math.PI/2;chairParts(0).forEach(([m,g])=>{g.translate(0.85,0,0);g.rotateY(a+Math.PI);L.push([m,g]);});}return L;},
 pc:()=>[['deskTop',B(0.6,0.03,0.9,0,0.72,0)],['frameG',B(0.58,0.7,0.03,0,0.36,-0.43)],['frameG',B(0.58,0.7,0.03,0,0.36,0.43)],['tv',B(0.04,0.32,0.52,-0.2,0.98,0)],['tv',B(0.15,0.02,0.4,0.05,0.745,0)]].concat(chairParts(0.55)),
 lab:()=>[['tv',B(1.2,0.04,1.8,0,0.86,0)],['woodLight',B(1.1,0.82,1.7,0,0.41,0)],['frameG',C(0.17,0.03,0.8,0.6,-0.5)],['frameG',C(0.17,0.03,0.8,0.6,0.5)],['frameG',C(0.17,0.03,-0.8,0.6,-0.5)],['frameG',C(0.17,0.03,-0.8,0.6,0.5)]],
 piano:()=>[['tv',B(0.6,1.25,1.5,0,0.62,0)]],
 office:()=>[['deskTop',B(0.7,0.03,1.4,0,0.73,0)],['woodLight',B(0.66,0.7,0.03,0,0.35,-0.68)],['woodLight',B(0.66,0.7,0.03,0,0.35,0.68)],['frost',B(0.03,0.45,1.4,-0.36,0.97,0)],['tv',B(0.04,0.32,0.52,-0.2,0.95,0)],
  ['chairDark',B(0.48,0.08,0.48,0.6,0.46,0)],['chairDark',B(0.06,0.5,0.46,0.84,0.75,0)],['frameG',C(0.025,0.42,0.6,0.21,0)],['frameG',B(0.5,0.03,0.06,0.6,0.03,0)],['frameG',B(0.06,0.03,0.5,0.6,0.03,0)]],
 sofa:()=>[['sofa',B(0.85,0.42,2.0,0,0.21,0)],['sofa',B(0.2,0.45,2.0,0.33,0.62,0)],['sofa',B(0.85,0.25,0.18,0,0.52,0.92)],['sofa',B(0.85,0.25,0.18,0,0.52,-0.92)],['woodLight',B(0.6,0.4,1.1,-1.0,0.2,0)]],
 mtable:()=>{const L=[['woodLight',B(1.4,0.04,3.6,0,0.73,0)],['frameG',B(0.1,0.7,3.0,0,0.36,0)]];for(let k=0;k<5;k++){for(const s of[-1,1]){chairParts(0).forEach(([m,g])=>{g.rotateY(s>0?0:Math.PI);g.translate(s*0.95,0,-1.5+k*0.75);L.push([m.replace('lime','chairDark'),g]);});}}return L;},
 bed:()=>[['white',B(2.0,0.5,0.9,0,0.25,0)],['sheet',B(1.5,0.06,0.88,0.2,0.53,0)],['white',B(0.3,0.08,0.6,-0.8,0.56,0)],['frameG',B(0.04,0.9,0.9,-1.0,0.45,0)]],
 ltable:()=>[['deskTop',B(0.8,0.03,2.0,0,0.72,0)],['frameG',B(0.05,0.7,1.6,0,0.36,0)],['lime',B(0.3,0.03,2.0,0.6,0.43,0)],['lime',B(0.3,0.03,2.0,-0.6,0.43,0)],['frameG',B(0.05,0.42,1.6,0.6,0.21,0)],['frameG',B(0.05,0.42,1.6,-0.6,0.21,0)]],
 stall:()=>[['stall',B(0.03,2.0,1.5,0.5,1.05,0)],['stall',B(0.03,2.0,1.5,-0.5,1.05,0)],['stall',B(0.9,2.0,0.03,0,1.05,-0.74)],['white',B(0.4,0.42,0.55,0,0.21,0.4)]],
 gym:()=>[['tv',B(1.8,0.2,0.7,0,0.4,0)],['tv',B(0.1,1.2,0.7,0.8,0.6,0)],['frameG',B(1.6,0.05,0.05,0,1.1,0)]],
};
export function partsFor(type){return (LIB[type]||(()=>[]))();}
export function buildInstanced(type,list,mats){ // list of [x,y,z(three),ry,(sx)]
 const parts=partsFor(type);if(!parts.length)return [];const byM={};
 for(const [m,g] of parts){(byM[m]=byM[m]||[]).push(g.index?g.toNonIndexed():g);}
 const out=[];const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(1,1,1),Pv=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0);
 for(const m in byM){const geo=mergeGeometries(byM[m].map(g=>{for(const a of Object.keys(g.attributes))if(!['position','normal','uv'].includes(a))g.deleteAttribute(a);if(!g.attributes.uv){g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));}return g;}));
  const im=new THREE.InstancedMesh(geo,mats[m]||mats.white,list.length);
  list.forEach((it,i)=>{Pv.set(it[0],it[1],it[2]);Q.setFromAxisAngle(Y,it[3]);M4.compose(Pv,Q,S);im.setMatrixAt(i,M4);});
  im.instanceMatrix.needsUpdate=true;im.castShadow=false;im.receiveShadow=true;im.userData.furnType=type;im.computeBoundingSphere();out.push(im);}
 return out;}
