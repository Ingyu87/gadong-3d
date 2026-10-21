import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from './tex.js';
import {buildInstanced} from './furn.js';
const Q=new URLSearchParams(location.search);const SHOT=Q.has('shot');
const MOBILE=matchMedia('(pointer:coarse)').matches||innerWidth<760;
await document.fonts.load('bold 40px NanumGothic').catch(()=>{});
const r=new THREE.WebGLRenderer({antialias:!MOBILE,preserveDrawingBuffer:SHOT,powerPreference:'high-performance'});
r.setPixelRatio(Math.min(devicePixelRatio,MOBILE?1.5:2));r.setSize(innerWidth,innerHeight);r.toneMapping=THREE.ACESFilmicToneMapping;r.outputColorSpace=THREE.SRGBColorSpace;
r.shadowMap.enabled=!MOBILE;r.shadowMap.type=THREE.PCFSoftShadowMap;document.getElementById('view').appendChild(r.domElement);
const scene=new THREE.Scene();
{const c=document.createElement('canvas');c.width=2;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#b9cde0');g.addColorStop(0.55,'#e6ecf0');g.addColorStop(1,'#f0f0ee');x.fillStyle=g;x.fillRect(0,0,2,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;scene.background=t;}
const pm=new THREE.PMREMGenerator(r);scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=0.35;
scene.fog=new THREE.Fog(0xe6ecf0,250,700);
const cam=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.05,1500);
scene.add(new THREE.HemisphereLight(0xdde8f5,0x8a7f6a,0.95));
const sun=new THREE.DirectionalLight(0xfff1dc,2.5);sun.position.set(-40,110,140);sun.castShadow=!MOBILE;sun.shadow.mapSize.set(4096,4096);sun.shadow.bias=-0.002;sun.shadow.normalBias=0.1;
Object.assign(sun.shadow.camera,{left:-110,right:110,top:110,bottom:-110,near:1,far:500});sun.target.position.set(0,0,20);scene.add(sun,sun.target);
// ---------- materials ----------
function tri(m,sx,sy=sx){m.onBeforeCompile=(sh)=>{sh.uniforms.triS={value:new THREE.Vector2(1/sx,1/sy)};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;').replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
 vec4 wq=vec4(transformed,1.0);
 #ifdef USE_INSTANCING
 wq=instanceMatrix*wq;
 #endif
 wq=modelMatrix*wq;vWP=wq.xyz;
 vec3 on=objectNormal;
 #ifdef USE_INSTANCING
 on=mat3(instanceMatrix)*on;
 #endif
 vWN=normalize(mat3(modelMatrix)*on);`);
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;uniform vec2 triS;').replace('#include <map_fragment>',`
 vec3 bw=pow(abs(normalize(vWN)),vec3(6.0));bw/=(bw.x+bw.y+bw.z);
 vec4 tc=texture2D(map,vWP.zy*triS)*bw.x+texture2D(map,vWP.xz*triS)*bw.y+texture2D(map,vWP.xy*triS)*bw.z;
 diffuseColor*=tc;`);};m.customProgramCacheKey=()=>'tri'+sx+'_'+sy;return m;}
const std=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:0.85,metalness:0},o));
const metalTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d');x.fillStyle='#9fa9b0';x.fillRect(0,0,256,256);for(let i=0;i<256;i+=32){x.fillStyle='#87929a';x.fillRect(i,0,6,256);x.fillStyle='#b5bec4';x.fillRect(i+6,0,3,256);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t;})();
const M={
 brick:tri(std({map:T.brick(),roughness:0.92}),1.0,0.6),wallIn:std({color:0xf3f5f1}),plaster:std({color:0xf3f5f1}),white:std({color:0xefede6,roughness:0.6}),
 frameW:std({color:0xe8eae9,roughness:0.4}),frameT:std({color:0x2f8c86,roughness:0.5}),rail:std({color:0xc9cdd0,metalness:0.6,roughness:0.35}),
 glass:new THREE.MeshPhysicalMaterial({color:0x3f7890,roughness:0.04,metalness:0.25,transparent:true,opacity:0.55,envMapIntensity:1.6,side:THREE.DoubleSide,depthWrite:false}),
 glassIn:new THREE.MeshPhysicalMaterial({color:0xcfe6ee,roughness:0.05,transparent:true,opacity:0.25,depthWrite:false,side:THREE.DoubleSide}),
 frost:std({color:0xdde9ee,roughness:0.3,transparent:true,opacity:0.8}),green:std({color:0x3b6b55,roughness:0.55,metalness:0.25}),roofMetal:std({color:0x3e6e58,roughness:0.5,metalness:0.3}),
 stone:tri(std({map:T.noise('#d9cdb4',0.07,2),roughness:0.8}),2),slab:std({color:0xe9e8e4}),corrFloor:tri(std({map:T.terrazzo(),roughness:0.22,metalness:0.05,envMapIntensity:1.2}),1.2),mint:std({color:0xcfe8dd,roughness:0.7}),skirt:std({color:0x5a5550,roughness:0.6}),
 woodF:tri(std({map:T.wood('#83562f',0.09,0.9,1.2),roughness:0.3}),1.2),woodLight:tri(std({map:T.wood('#d8c39c',0.6,2.4,2.4),roughness:0.6}),2.4),
 woodFrame:tri(std({map:T.wood('#a8743f',0.1,1,1),roughness:0.55}),1),door:tri(std({map:T.wood('#9c6a3a',0.25,2.2,2.2),roughness:0.6}),2.2),
 ceil:tri(std({map:T.ceilTile(),emissive:0xffffff,emissiveIntensity:0.07}),0.6),led:new THREE.MeshBasicMaterial({color:0xffffff}),
 stair:tri(std({map:T.noise('#bdb8ae',0.1,1),roughness:0.5}),1),metalPanel:tri(std({map:metalTex,roughness:0.5,metalness:0.3}),3),
 asphalt:tri(std({map:T.noise('#5d5f61',0.12,2),roughness:0.95}),2),dirt:tri(std({map:T.noise('#c8ae86',0.12,3),roughness:1}),3),paving:tri(std({map:T.noise('#b9b4aa',0.1,1),roughness:0.9}),1),
 grass:std({color:0x6f8f45,roughness:1}),fence:std({color:0x2f5a48,metalness:0.4,roughness:0.5}),concrete:tri(std({map:T.noise('#bdbab3',0.08,2)}),2),line:std({color:0xf4f4f0}),
 yellow:std({color:0xe8b81f}),red:std({color:0xc9382c}),darkglass:std({color:0x2a3036,roughness:0.2}),
 tv:std({color:0x111214,roughness:0.15}),metal:std({color:0x9aa0a6,metalness:0.6,roughness:0.4}),deskTop:std({color:0xe3e6e3,roughness:0.4}),lime:std({color:0x9cc23a,roughness:0.5}),
 frameG:std({color:0xd5d8da,metalness:0.5,roughness:0.35}),chairDark:std({color:0x33373d}),sofa:std({color:0x7a5a46}),sheet:std({color:0x8fb3d9}),stall:std({color:0xe6ddd0}),
 board:std({map:T.board(),roughness:0.3}),flag:std({map:T.flag()}),bark:std({color:0x6a4b33}),pine:std({color:0x4f7a35,roughness:0.9}),leaf:std({color:0x6e9a48,roughness:0.9})};
// ---------- state ----------
const man=await (await fetch('manifest.json')).json();
const chunks={};const root=new THREE.Group();scene.add(root);
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
const prog=document.getElementById('prog');
let loaded=0;
const KEEP_FIX=new Set(['led','ac']);
function classOnly(c,list){const rooms=man.labels.filter(l=>l.floor===c.floor&&(!l.bld||l.bld===c.bld)&&l.room&&/^교실/.test(l.name)).map(l=>l.room);
 return (list||[]).filter(f=>KEEP_FIX.has(f[0])||rooms.some(r=>f[1]>=r[0]-0.05&&f[1]<=r[2]+0.05&&f[3]>=r[1]-0.05&&f[3]<=r[3]+0.05));}
function addFurn(group,list){const by={};for(const it of list){(by[it[0]]=by[it[0]]||[]).push(it);}
 for(const k in by){if(k==='pine'||k==='tree'||k==='stage')continue;const ims=buildInstanced(k,by[k].map(f=>[f[1],f[2],-f[3],f[4]]),M);ims.forEach(m=>group.add(m));}
 (by.stage||[]).forEach(f=>{const s=new THREE.Mesh(new THREE.BoxGeometry(f[5]-0.4,1.0,f[6]-0.4),M.woodF);s.position.set(f[1],f[2]+0.5,-f[3]);s.receiveShadow=true;group.add(s);});}
function trees(list){const g=new THREE.Group();const pine=[],tree=[];list.forEach(f=>{if(f[0]==='pine')pine.push(f);if(f[0]==='tree')tree.push(f);});
 const mk=(parts,lst)=>{const byM={};parts.forEach(([m,geo])=>{(byM[m]=byM[m]||[]).push(geo.toNonIndexed());});const M4=new THREE.Matrix4(),Qt=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0);
  for(const m in byM){const geo=mergeGeometries(byM[m].map(q=>{for(const a of Object.keys(q.attributes))if(!['position','normal'].includes(a))q.deleteAttribute(a);return q;}));const im=new THREE.InstancedMesh(geo,M[m],lst.length);
   lst.forEach((f,i)=>{const s=f[5]||1;Qt.setFromAxisAngle(Y,f[4]);M4.compose(new THREE.Vector3(f[1],f[2],-f[3]),Qt,new THREE.Vector3(s,s,s));im.setMatrixAt(i,M4);});im.castShadow=!MOBILE;im.computeBoundingSphere();g.add(im);}};
 const pp=[];{const t=new THREE.CylinderGeometry(0.18,0.3,3.4,8);t.rotateZ(0.25);t.translate(0.3,1.7,0);pp.push(['bark',t]);for(let i=0;i<8;i++){const c=new THREE.SphereGeometry(1.5,10,7);c.scale(1.35,0.36,1.1);const a=i*0.85;c.translate(Math.cos(a)*1.9*(i%3?1:0.2),2.3+(i%3)*0.8,Math.sin(a)*1.7);pp.push(['pine',c]);}}
 const tp=[];{const t=new THREE.CylinderGeometry(0.2,0.28,3.2,8);t.translate(0,1.6,0);tp.push(['bark',t]);const c=new THREE.IcosahedronGeometry(2.6,1);c.translate(0,4.6,0);tp.push(['leaf',c]);}
 if(pine.length)mk(pp,pine);if(tree.length)mk(tp,tree);return g;}
function textPlane(txt,w,h,opts){const t=T.textTex(txt,opts);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:0.5}));return m;}
function logoTex(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.translate(128,128);x.beginPath();for(let i=0;i<24;i++){const a=i*Math.PI/12,rr=i%2?104:122;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}x.closePath();
 x.fillStyle='#2f7d55';x.fill();x.lineWidth=8;x.strokeStyle='#1d4b38';x.stroke();x.lineWidth=12;x.strokeStyle='#e46a8c';x.beginPath();x.arc(0,0,56,0,7);x.stroke();
 x.fillStyle='#f2c418';x.fillRect(-78,-34,64,16);x.fillRect(-30,-34,16,62);x.fillRect(-62,12,48,16);x.fillRect(4,-34,74,16);x.fillRect(4,-34,16,62);x.fillRect(4,12,74,16);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
// ---------- stairs (from DXF stair cores) ----------
let STAIRS=[];const stairsReady=fetch('stairs.json').then(r=>r.json()).then(d=>STAIRS=d).catch(()=>{});
function flightY(f,x,n){const u=f.x1-f.x0>f.n1-f.n0&&false?0:0;const along=(f.kind==='landing')?null:(STAIRRUN(f));if(!along)return f.y0;const [lo,hi,v]=along(x,n);const t=Math.max(0,Math.min(1,(v-lo)/(hi-lo)));return f.start==='hi'?f.y0+(1-t)*(f.y1-f.y0):f.y0+t*(f.y1-f.y0);}
function STAIRRUN(f){return f.run==='x'?((x,n)=>[f.x0,f.x1,x]):((x,n)=>[f.n0,f.n1,n]);}
function inR(f,x,n,m=0){return x>=f.x0-m&&x<=f.x1+m&&n>=f.n0-m&&n<=f.n1+m;}
function surfaceAt(x,n,feet){let best=-1e9;const cand=[];
 for(const st of STAIRS){if(!chunks[st.bld+'_'+st.floor])continue;for(const f of st.flights){f.run=st.run;if(inR(f,x,n))cand.push(flightY(f,x,n));}}
 for(const k in WALLS){const W=WALLS[k];if(k==='main_porch')continue;const c=chunks[k];if(!c)continue;if(!c.box)c.box=new THREE.Box3().setFromObject(c.group);const b=c.box;if(x<b.min.x||x>b.max.x||-n<b.min.z||-n>b.max.z)continue;
  const hole=STAIRS.some(st=>st.bld+'_'+st.to===k&&inR({x0:st.core[0],n0:st.core[1],x1:st.core[2],n1:st.core[3]},x,n));if(!hole)cand.push(W.e);}
 cand.push(0);for(const y of cand)if(y<=feet+0.45&&y>best)best=y;return best===-1e9?feet:best;}
window.__surface=(x,n,f)=>surfaceAt(x,n,f);
const railMat=new THREE.MeshStandardMaterial({color:0x8a9aa6,metalness:0.4,roughness:0.5,transparent:true,opacity:0.85});
function buildStairs(){const byChunk={};for(const st of STAIRS){const k=st.bld+'_'+st.floor;(byChunk[k]=byChunk[k]||[]).push(st);}
 for(const k in byChunk){const c=chunks[k];if(!c)continue;const mats=[],rails=[];
  for(const st of byChunk[k])for(const f of st.flights){if(f.kind==='landing'){const m=new THREE.Matrix4().compose(new THREE.Vector3((f.x0+f.x1)/2,f.y0-0.1,-(f.n0+f.n1)/2),new THREE.Quaternion(),new THREE.Vector3(f.x1-f.x0,0.2,f.n1-f.n0));mats.push(m);continue;}
   const run=st.run==='x'?f.x1-f.x0:f.n1-f.n0;const N=Math.max(4,Math.round((f.y1-f.y0)/0.16));const tw=run/N;
   for(let i=0;i<N;i++){const top=f.y0+(i+1)*(f.y1-f.y0)/N;const h=Math.max(0.16,top-f.y0+0.05);// step i from start end
    const s0=f.start==='hi'?(st.run==='x'?f.x1:f.n1)-(i+1)*tw:(st.run==='x'?f.x0:f.n0)+i*tw;const cx=st.run==='x'?s0+tw/2:(f.x0+f.x1)/2,cn=st.run==='x'?(f.n0+f.n1)/2:s0+tw/2;
    const sx=st.run==='x'?tw:f.x1-f.x0,sn=st.run==='x'?f.n1-f.n0:tw;const hh=Math.min(h,0.6);
    mats.push(new THREE.Matrix4().compose(new THREE.Vector3(cx,top-hh/2,-cn),new THREE.Quaternion(),new THREE.Vector3(sx,hh,sn)));
    // underside slab
   }
   const ang=Math.atan2(f.y1-f.y0,run);const L=Math.hypot(run,f.y1-f.y0);const mid=[(f.x0+f.x1)/2,(f.y0+f.y1)/2-0.25,(f.n0+f.n1)/2];
   const q=new THREE.Quaternion().setFromEuler(st.run==='x'?new THREE.Euler(0,0,(f.start==='hi'?-1:1)*ang):new THREE.Euler((f.start==='hi'?1:-1)*ang,0,0));
   mats.push(new THREE.Matrix4().compose(new THREE.Vector3(mid[0],mid[1],-mid[2]),q,new THREE.Vector3(st.run==='x'?L:f.x1-f.x0,0.15,st.run==='x'?f.n1-f.n0:L)));
   {const cxC=(st.core[0]+st.core[2])/2,cnC=(st.core[1]+st.core[3])/2;const sides=[];
    if(st.run==='x'){const inn=Math.abs(f.n0-cnC)<Math.abs(f.n1-cnC)?f.n0:f.n1;sides.push(inn);if(st.ext||st.flights.filter(g=>g.kind==='flight').length<2)sides.push(inn===f.n0?f.n1:f.n0);}
    else{const inn=Math.abs(f.x0-cxC)<Math.abs(f.x1-cxC)?f.x0:f.x1;sides.push(inn);if(st.ext||st.flights.filter(g=>g.kind==='flight').length<2)sides.push(inn===f.x0?f.x1:f.x0);}
    for(const sv of sides){const yy=(f.y0+f.y1)/2;const P_=st.run==='x'?new THREE.Vector3(mid[0],yy+0.5,-sv):new THREE.Vector3(sv,yy+0.5,-mid[2]);
     rails.push(new THREE.Matrix4().compose(P_,q,st.run==='x'?new THREE.Vector3(L,0.85,0.03):new THREE.Vector3(0.03,0.85,L)));
     const T_=P_.clone();T_.y+=0.45;rails.push(new THREE.Matrix4().compose(T_,q,st.run==='x'?new THREE.Vector3(L,0.06,0.07):new THREE.Vector3(0.07,0.06,L)));}}
  }
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),M.stair,mats.length);mats.forEach((m,i)=>im.setMatrixAt(i,m));im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();im.castShadow=!MOBILE;im.receiveShadow=true;im.userData.mat='stair';im.userData.isStair=true;c.group.add(im);if(rails.length){const rm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),railMat,rails.length);rails.forEach((m,i)=>rm.setMatrixAt(i,m));rm.instanceMatrix.needsUpdate=true;rm.computeBoundingSphere();rm.userData.isStair=true;c.group.add(rm);}}
}
let SIGNS=[];const signReady=fetch('signs.json').then(r=>r.json()).then(d=>SIGNS=d).catch(()=>{});
function buildCorrLights(){for(const f of['1F','2F','3F','4F','5F']){const ch=chunks['main_'+f];if(!ch)continue;const e=(man.chunks.find(c=>c.name==='main_'+f)||{}).elev||0;const ms=[];for(let x=-45;x<=46;x+=3.0){if(Math.abs(x-2.5)<5&&f!=='1F')continue;ms.push(new THREE.Matrix4().compose(new THREE.Vector3(x,e+2.885,-21.8),new THREE.Quaternion(),new THREE.Vector3(1.2,0.03,0.3)));}
 const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),M.led,ms.length);ms.forEach((m,i)=>im.setMatrixAt(i,m));im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();im.userData.furnType='led';ch.group.add(im);}}
const FSZ={desk:[0.45,0.64,0,0.12],tdesk:[0.7,1.3,0,0.1],shelf:[0.35,1.2,-0.175,0.05],cabinet:[0.5,0.9,-0.25,0.05],shelf2:[0.4,1.5,0,0.05],ltable:[1.2,0.6,0,0.1],lab:[1.2,0.9,0,0.1],office:[0.7,1.2,0,0.1],piano:[0.6,1.5,0,0.05],bed:[0.9,1.9,0,0.05],sofa:[0.8,1.8,0,0.05],mtable:[1.2,2.4,0,0.1],pc:[0.6,1.2,0,0.1],front:[0.4,3.0,0,0.05]};
function addFurnCollision(){for(const ch of man.chunks){const W=WALLS[ch.name];if(!W||!ch.furn)continue;for(const f of classOnly(ch,ch.furn)){const z=FSZ[f[0]];if(!z)continue;const [w,d,ox,sh]=z;const r=f[4]||0,c=Math.cos(r),s_=Math.sin(r);const cx=f[1]+ox*c,cn=f[3]-ox*s_;const hx=Math.abs(c)*w/2+Math.abs(s_)*d/2-sh,hn=Math.abs(s_)*w/2+Math.abs(c)*d/2-sh;if(hx>0.02&&hn>0.02)W.r.push([cx-hx,cn-hn,cx+hx,cn+hn]);}}
 for(const f of FIXT){if(/PART/.test(f.kind))continue;for(const k in chunks){const c=chunks[k];if(c.floor!==f.floor||c.kind!=='floor'||!WALLS[k]||!c.box)continue;if(!c.box.containsPoint(new THREE.Vector3(f.x,f.e+0.5,-f.n)))continue;const rot=Math.round(((f.rot||0)%180+180)%180);const w=(rot===90?f.d:f.w)/2-0.1,d=(rot===90?f.w:f.d)/2-0.1;if(w>0.02&&d>0.02)WALLS[k].r.push([f.x-w,f.n-d,f.x+w,f.n+d]);break;}}}
function buildSigns(){for(const g of SIGNS){const ch=chunks[g.bld+'_'+g.floor];if(!ch)continue;const grp=new THREE.Group();const w=Math.min(1.1,0.25+0.16*[...g.t].length),h=0.2;
 const pl=new THREE.Mesh(new THREE.BoxGeometry(0.03,h+0.04,w+0.04),signMat);grp.add(pl);
 for(const sd of[1,-1]){const t=textPlane(g.t,w,h,{w:512,h:96,font:'bold 64px NanumGothic, sans-serif',fg:'#ffffff',bg:'#2f6f68'});t.rotation.y=sd*Math.PI/2;t.position.x=sd*0.017;grp.add(t);}
 const off=g.s*(w/2+0.02);if(g.ax==='x'){grp.position.set(g.x,g.y,-(g.n+off));}else{grp.rotation.y=Math.PI/2;grp.position.set(g.x+off,g.y,-g.n);}grp.userData.kind='sign';ch.group.add(grp);}}
const signMat=new THREE.MeshStandardMaterial({color:0xf2f2ee,roughness:0.5});
let COLS=[];const colReady=fetch('columns.json').then(r=>r.json()).then(d=>COLS=d).catch(()=>{});
function buildColumns(){const by={};for(const c of COLS){const k=c.bld+'_'+c.floor;if(!chunks[k])continue;(by[k]=by[k]||[]).push(c);}for(const k in by){const ch=chunks[k];const e=(man.chunks.find(c=>c.name===k)||{}).elev||0;const h=(man.chunks.find(c=>c.name===k)||{}).h||3.6;const ms=by[k].map(c=>new THREE.Matrix4().compose(new THREE.Vector3(c.x,e+h/2-0.1,-c.n),new THREE.Quaternion(),new THREE.Vector3(c.w+0.04,h-0.2,c.d+0.04)));const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),colMat,ms.length);ms.forEach((m,i)=>im.setMatrixAt(i,m));im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();im.userData.kind='column';ch.group.add(im);}}
const colMat=new THREE.MeshStandardMaterial({color:0xe9e7e1,roughness:0.85});
let FIXT=[];const fixtReady=fetch('fixtures.json').then(r=>r.json()).then(d=>FIXT=d).catch(()=>{});
const fixMat=std({color:0xf4f6f6,roughness:0.3});
function buildFixtures(){const by={};for(const f of FIXT){let ck=null;for(const k in chunks){const c=chunks[k];if(c.floor!==f.floor||c.kind!=='floor')continue;if(!c.box)c.box=new THREE.Box3().setFromObject(c.group);if(c.box.containsPoint(new THREE.Vector3(f.x,f.e+0.5,-f.n))){ck=k;break;}}if(!ck)continue;(by[ck]=by[ck]||[]).push(f);}
 for(const k in by){const ms=by[k].map(f=>{const h=/PART/.test(f.kind)?1.9:/URIN/.test(f.kind)?0.6:/UNIT/.test(f.kind)?0.42:0.82;const y=/PART/.test(f.kind)?f.e+0.12+h/2:/URIN/.test(f.kind)?f.e+0.45+h/2:/UNIT/.test(f.kind)?f.e+0.62:f.e+h/2;return new THREE.Matrix4().compose(new THREE.Vector3(f.x,y,-f.n),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,THREE.MathUtils.degToRad(f.rot),0)),new THREE.Vector3(f.w,h,f.d));});
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),fixMat,ms.length);ms.forEach((m,i)=>im.setMatrixAt(i,m));im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();chunks[k].group.add(im);}}
function decorate(){buildStairs();buildFixtures();buildColumns();buildSigns();buildCorrLights();addFurnCollision();const s=man.sign;if(s){const g=new THREE.Group();const n=[...s.text];const cx=(s.x0+s.x1)/2;const sp=Math.min(5.4,(s.x1-s.x0)/(n.length+1.5));
 n.forEach((ch,i)=>{const p=textPlane(ch,1.6,1.6,{w:256,h:256,font:'bold 230px NanumGothic, sans-serif'});p.position.set(cx+(i-(n.length-1)/2)*sp+sp*0.6,s.y,-(s.n-0.26));g.add(p);});
 const lg=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshStandardMaterial({map:logoTex(),transparent:true}));lg.position.set(cx-(n.length-1)/2*sp-sp*0.5,s.y,-(s.n-0.26));g.add(lg);
 g.userData.kind='roofdeco';chunks.main_roof?.group.add(g);}
 const p=man.porch;if(p&&chunks.main_porch){const b=textPlane('고운마음 ✿ 바른행동',8.6,0.7,{w:2048,h:160,font:'bold 120px NanumGothic, sans-serif',fg:'#6b5a3e'});b.position.set(p.x,p.sign??3.75,p.front!==undefined?-(p.front-0.08):-(p.n)+0.01);chunks.main_porch.group.add(b);
  const lg=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.8),new THREE.MeshStandardMaterial({map:logoTex(),transparent:true}));lg.position.set(p.x-4.9,p.sign??3.75,p.front!==undefined?-(p.front-0.09):-(p.n)+0.02);chunks.main_porch.group.add(lg);}
 (man.gates||[]).forEach(([x,n])=>{const t=textPlane('서울가동초등학교',4.6,0.6,{w:1536,h:200,font:'bold 140px NanumGothic, sans-serif',fg:'#5a4a34'});t.position.set(x,1.3,-n+0.42);chunks.site?.group.add(t);const t2=t.clone();t2.rotation.y=Math.PI;t2.position.z=-n-0.42;chunks.site?.group.add(t2);
  const w=new THREE.Mesh(new THREE.BoxGeometry(4.8,1.6,0.8),M.stone);w.position.set(x,0.8,-n);chunks.site?.group.add(w);});}
const ORDER=c=>c.kind==='site'?0:c.kind==='roof'?2:(c.bld==='main'?1:3);
const list=[...man.chunks].sort((a,b)=>ORDER(a)-ORDER(b)||a.elev-b.elev);
async function loadChunk(c){const g=await loader.loadAsync(c.file);const grp=new THREE.Group();grp.name=c.name;
 g.scene.traverse(o=>{if(o.isMesh){if(!o.geometry.attributes.normal){o.geometry=o.geometry.toNonIndexed();o.geometry.computeVertexNormals();}const n=(o.material&&o.material.name)||'';const mm=M[n]||M.white;o.material=mm;o.castShadow=!MOBILE&&!mm.transparent&&c.kind!=='site';o.receiveShadow=true;o.userData.mat=n;}});
 await doorsReady;await stairsReady;await fixtReady;await colReady;await signReady;if(c.kind!=='site'){const rm=[];g.scene.traverse(o=>{if(o.isMesh&&o.userData.mat==='door')rm.push(o);});rm.forEach(o=>o.removeFromParent());buildDoors(c,grp);}
 grp.add(g.scene);const fg=new THREE.Group();fg.name='furn';if(c.kind==='site')fg.add(trees(c.furn));else addFurn(fg,classOnly(c,c.furn));grp.add(fg);
 root.add(grp);chunks[c.name]={...c,group:grp};loaded++;prog.textContent=`불러오는 중 ${loaded}/${list.length}`;if(loaded===list.length){prog.style.display='none';decorate();applyFloor();SITEB=null;if(!userMoved&&!walk)defaultView(false);window.__loaded=true;}
 render();}
// sequential with small concurrency
(async()=>{const q=[...list];const work=async()=>{while(q.length){await loadChunk(q.shift());}};await Promise.all([work(),work(),work()]);})();
// ---------- labels ----------
const labelGroup=new THREE.Group();scene.add(labelGroup);const labels=[];
function mkLabel(t,sub){const c=document.createElement('canvas');const x=c.getContext('2d');x.font='bold 44px NanumGothic, sans-serif';const w=Math.ceil(x.measureText(t).width)+40;c.width=w;c.height=72;
 x.fillStyle='rgba(255,255,255,0.9)';x.beginPath();x.roundRect(2,2,w-4,68,24);x.fill();x.strokeStyle='rgba(31,61,107,0.35)';x.lineWidth=3;x.stroke();x.fillStyle='#1f3d6b';x.font='bold 44px NanumGothic, sans-serif';x.textBaseline='middle';x.fillText(t,20,38);
 const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:false,sizeAttenuation:false}));sp.renderOrder=10;sp.userData.aspect=w/72;return sp;}
man.labels.forEach(l=>{if(l.name.startsWith('계단'))return;const sp=mkLabel(l.name);sp.position.set(l.pos[0],l.pos[1]+2.2,-l.pos[2]);sp.userData.l=l;labelGroup.add(sp);labels.push(sp);});
const BLD_LABELS=[['본관(교사동)',2,22,18],['정보화동',-47,14,-25],['다목적강당',54,13,-35],['실내야구연습장',48.5,11,-78.7],['운동장',0,2,-55]];
const bldSprites=BLD_LABELS.map(([t,x,y,n])=>{const s=mkLabel(t);s.position.set(x,y,-n);labelGroup.add(s);return s;});
function sizeLabels(){const k=MOBILE?0.045:0.032;labels.concat(bldSprites).forEach(s=>s.scale.set(k*s.userData.aspect*innerHeight/innerWidth*(innerWidth/innerHeight),k,1));}
// ---------- floors / visibility ----------
const FLOORS=['all','B1','1F','2F','3F','4F','5F'];let curFloor='all',cut=true,showLabels=true;
const ELEV={'B1':-3.6,'1F':0,'2F':3.6,'3F':7.2,'4F':10.8,'5F':14.4};
function applyFloor(){const thr=curFloor==='all'?1e9:ELEV[curFloor];
 for(const k in chunks){const c=chunks[k];let vis=true;
  if(c.kind==='roof')vis=curFloor==='all';else if(c.kind==='floor'||c.kind==='porch'){vis=c.floor==='all'?(curFloor==='all'||thr>=0):c.elev<=thr+0.01;if(curFloor==='B1')vis=c.floor==='B1';}
  c.group.visible=vis;
  const top=curFloor!=='all'&&cut&&Math.abs(c.elev-thr)<0.01;
  c.group.traverse(o=>{if(o.isMesh&&(o.userData.mat==='ceil'))o.visible=!top||walk;if(o.isInstancedMesh&&['led','ac'].includes(o.userData.furnType))o.visible=!top||walk;});
  if(c.name==='baseball'){c.group.traverse(o=>{if(o.isMesh&&o.userData.mat==='roofMetal')o.visible=curFloor==='all';});}
 }
 labels.forEach(s=>{const l=s.userData.l;s.visible=showLabels&&(curFloor==='all'?false:(l.floor===curFloor||(l.floor==='site'&&false)));});
 bldSprites.forEach(s=>s.visible=showLabels&&curFloor==='all');
 document.querySelectorAll('#floors button').forEach(b=>b.classList.toggle('on',b.dataset.f===curFloor));render();}
// ---------- controls ----------
const ctl=new OrbitControls(cam,r.domElement);ctl.enableDamping=true;ctl.dampingFactor=0.12;ctl.minDistance=45;ctl.maxDistance=420;ctl.minPolarAngle=0.30;ctl.maxPolarAngle=1.31;ctl.addEventListener('change',render);ctl.screenSpacePanning=false;ctl.zoomToCursor=true;ctl.panSpeed=1.0;ctl.rotateSpeed=0.6;ctl.zoomSpeed=0.8;ctl.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};ctl.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};
let walk=false,yaw=0,pitch=0;const keys={};const joy={x:0,y:0};
addEventListener('keydown',e=>{keys[e.code]=true;loop();});addEventListener('keyup',e=>keys[e.code]=false);
let lookId=null,last=null,downAt=null,dragged=false;const ptrs=new Map();let pinch0=null,twist0=null;const EYE=1.5;
r.domElement.addEventListener('contextmenu',e=>e.preventDefault());
r.domElement.addEventListener('pointerdown',e=>{downAt=[e.clientX,e.clientY];dragged=false;ptrs.set(e.pointerId,[e.clientX,e.clientY]);if(!walk)return;
 if(ptrs.size===2){const v=[...ptrs.values()];pinch0={d:Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]),fov:cam.fov};lookId=null;return;}
 lookId=e.pointerId;last=[e.clientX,e.clientY];try{r.domElement.setPointerCapture(e.pointerId)}catch(_){}});
r.domElement.addEventListener('pointermove',e=>{if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,[e.clientX,e.clientY]);if(downAt&&Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>6)dragged=true;
 if(!walk){if(ptrs.size===2&&e.pointerType==='touch'){const v=[...ptrs.values()];const an=Math.atan2(v[1][1]-v[0][1],v[1][0]-v[0][0]);if(twist0!==null){let d=an-twist0;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;if(Math.abs(d)<0.5){const o=cam.position.clone().sub(ctl.target);o.applyAxisAngle(new THREE.Vector3(0,1,0),-d);cam.position.copy(ctl.target).add(o);cam.lookAt(ctl.target);ctl.update();render();}}twist0=an;}else twist0=null;hoverCursor(null);return;}
 if(pinch0&&ptrs.size===2){const v=[...ptrs.values()];const d=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]);cam.fov=Math.max(30,Math.min(90,pinch0.fov*pinch0.d/d));cam.updateProjectionMatrix();render();return;}
 if(e.pointerId===lookId&&last){const k=0.0045*cam.fov/72;yaw+=(e.clientX-last[0])*k;pitch=Math.max(-1.2,Math.min(1.2,pitch+(e.clientY-last[1])*k));last=[e.clientX,e.clientY];cam.rotation.set(pitch,yaw,0,'YXZ');hoverCursor(null);render();}
 else if(e.pointerType==='mouse')hoverCursor(e);});
const pend=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2){pinch0=null;twist0=null;}if(e.pointerId===lookId){lookId=null;last=null;}
 if(e.type==='pointerup'&&downAt&&!dragged&&e.button!==2)clickAt(e);downAt=null;};
r.domElement.addEventListener('pointerup',pend);r.domElement.addEventListener('pointercancel',pend);
r.domElement.addEventListener('wheel',e=>{if(!walk)return;cam.fov=Math.max(30,Math.min(90,cam.fov+e.deltaY*0.03));cam.updateProjectionMatrix();render();},{passive:true});
// ---------- doors ----------
let DOORS=[];const doorIMs=[];const doorMat=std({color:0x9c6a3a,roughness:0.6});
const doorsReady=fetch('doors.json').then(r=>r.json()).then(d=>DOORS=d).catch(()=>{});
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler();
function doorMatrix(d){const L=d.ax==='x'?d.x1-d.x0:d.n1-d.n0;const base=d.ax==='x'?0:Math.PI/2;const hx=d.ax==='x'?d.x0:(d.x0+d.x1)/2,hz=d.ax==='x'?-(d.n0+d.n1)/2:-d.n0;
 const a=base+d.ang;const c=Math.cos(a),s_=Math.sin(a);// leaf centre offset along rotated x
 _q.setFromEuler(_e.set(0,a,0));const H=d.h||2.1;return _m.compose(new THREE.Vector3(hx+c*L/2,d.e+H/2,hz-s_*L/2),_q,new THREE.Vector3(L,H,0.05));}
const doorGlass=new THREE.MeshPhysicalMaterial({color:0x9fc4d2,roughness:0.08,metalness:0.1,transparent:true,opacity:0.55,side:THREE.DoubleSide,depthWrite:false});
function buildDoors(c,grp){for(const g of [0,1]){const ds=DOORS.filter(d=>d.c===c.name&&(d.g?1:0)===g);if(!ds.length)continue;const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),g?doorGlass:doorMat,ds.length);im.userData.doors=ds;im.userData.isDoor=true;
 ds.forEach((d,i)=>{d.ang=0;d.tgt=0;d.im=im;d.i=i;d.h=d.g?2.35:2.1;im.setMatrixAt(i,doorMatrix(d));});im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();grp.add(im);doorIMs.push(im);}}
function animDoors(dt){let mv=false;for(const im of doorIMs){for(const d of im.userData.doors){if(d.ang!==d.tgt){const k=Math.min(1,(performance.now()-d.t0)/450);d.ang=k>=1?d.tgt:d.from+(d.tgt-d.from)*k;im.setMatrixAt(d.i,doorMatrix(d));im.instanceMatrix.needsUpdate=true;mv=true;}}if(mv)im.computeBoundingSphere();}return mv;}
function doorCentre(d){return new THREE.Vector3((d.x0+d.x1)/2,d.e,-(d.n0+d.n1)/2);}
function openDoor(d,through,pair=true){d.tgt=d.tgt?0:Math.PI/2*0.95;d.from=d.ang;d.t0=performance.now();loop();if(pair)for(const im of doorIMs)for(const o of im.userData.doors){if(o===d||o.c!==d.c||o.ax!==d.ax||Math.abs(o.e-d.e)>0.1)continue;const co=d.ax==='x'?Math.abs((o.n0+o.n1)-(d.n0+d.n1))<0.1&&(Math.abs(o.x0-d.x1)<0.05||Math.abs(o.x1-d.x0)<0.05):Math.abs((o.x0+o.x1)-(d.x0+d.x1))<0.1&&(Math.abs(o.n0-d.n1)<0.05||Math.abs(o.n1-d.n0)<0.05);if(co&&(o.tgt>0)!==(d.tgt>0)){o.tgt=d.tgt;o.from=o.ang;o.t0=d.t0;}}if(through&&d.tgt){const c=doorCentre(d);const nrm=d.ax==='x'?new THREE.Vector3(0,0,1):new THREE.Vector3(1,0,0);const side=Math.sign(cam.position.clone().sub(c).dot(nrm))||1;
 const t=c.clone().addScaledVector(nrm,-side*1.6);t.y=d.e+EYE;setTimeout(()=>glideTo(t,false),500);}}
function nearestDoor(){let best=null,bd=2.6;for(const im of doorIMs){if(!im.parent||!im.parent.visible)continue;for(const d of im.userData.doors){if(Math.abs(d.e+EYE-cam.position.y)>1.2)continue;const dd=doorCentre(d).setY(cam.position.y).distanceTo(cam.position);if(dd<bd){bd=dd;best=d;}}}return best;}
window.__doors=()=>doorIMs.reduce((a,im)=>a.concat(im.userData.doors.map(d=>({c:d.c,ax:d.ax,x0:d.x0,x1:d.x1,n0:d.n0,n1:d.n1,e:d.e,open:d.tgt>0,vis:!!(im.parent&&im.parent.visible)}))),[]);
// ---------- street-view glide / cursor / chevrons ----------
let glide=null;
function glideTo(t,ignoreCol){const from=cam.position.clone();let to=t.clone();if(!ignoreCol){const dir=to.clone().sub(from);dir.y=0;const L=dir.length();if(L<0.05)return;
  const hitD=freeDist(dir,L);if(hitD<L)to=from.clone().addScaledVector(dir.normalize(),Math.max(0,hitD-0.2)).setY(t.y);}
 to.y=from.y;glide={from,to,t0:performance.now(),dur:Math.min(1.2,0.35+from.distanceTo(to)*0.12)};loop();}
const cursor=new THREE.Mesh(new THREE.RingGeometry(0.28,0.4,40),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.85,depthTest:false}));cursor.rotation.x=-Math.PI/2;cursor.renderOrder=20;cursor.visible=false;scene.add(cursor);
const chev=new THREE.Group();scene.add(chev);chev.visible=false;
const chevGeo=(()=>{const sh=new THREE.Shape();sh.moveTo(0,0.45);sh.lineTo(0.42,-0.05);sh.lineTo(0.26,-0.2);sh.lineTo(0,0.1);sh.lineTo(-0.26,-0.2);sh.lineTo(-0.42,-0.05);sh.closePath();return new THREE.ShapeGeometry(sh);})();
const chevMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.9,depthTest:false,side:THREE.DoubleSide});
for(let k=0;k<8;k++){const m=new THREE.Mesh(chevGeo,chevMat.clone());m.rotation.order='YXZ';m.renderOrder=21;m.userData.chev=k;chev.add(m);}
let WALLS={};fetch('walls.json').then(r=>r.json()).then(w=>WALLS=w).catch(()=>{});
function curChunks(){const y=cam.position.y-EYE;return Object.keys(WALLS).filter(k=>chunks[k]&&chunks[k].group.visible&&WALLS[k].e<=y+0.3&&y-WALLS[k].e<2.9);}
function rayRect(ox,on,dx,dn,x0,n0,x1,n1){let t0=-1e9,t1=1e9;for(const [o,d,a,b] of [[ox,dx,x0,x1],[on,dn,n0,n1]]){if(Math.abs(d)<1e-9){if(o<a||o>b)return Infinity;}else{let ta=(a-o)/d,tb=(b-o)/d;if(ta>tb)[ta,tb]=[tb,ta];t0=Math.max(t0,ta);t1=Math.min(t1,tb);}}if(t0>t1||t1<0)return Infinity;return t0<0?Infinity:t0;}
function freeDist(dir,max){const R=0.3;const d=dir.clone().setY(0).normalize();const ox=cam.position.x,on=-cam.position.z,dx=d.x,dn=-d.z;let best=max+R;
 for(const k of curChunks()){const W=WALLS[k];for(const r of W.r){const t=rayRect(ox,on,dx,dn,r[0]-R,r[1]-R,r[2]+R,r[3]+R);if(t<best)best=t;}
  for(const q of W.s){const t=rayRect(ox,on,dx,dn,Math.min(q[0],q[2])-R,Math.min(q[1],q[3])-R,Math.max(q[0],q[2])+R,Math.max(q[1],q[3])+R);if(t<best)best=t;}}
 for(const im of doorIMs){if(!im.parent||!im.parent.visible)continue;for(const dd of im.userData.doors){if(dd.ang>0.3||Math.abs(dd.e+EYE-cam.position.y)>1)continue;const t=rayRect(ox,on,dx,dn,dd.x0-R+ (dd.ax==='n'?0:0),dd.n0-R,dd.x1+R,dd.n1+R);if(t<best)best=t;}}
 return Math.max(0,best-0.05);}
function updateChevrons(){const fe=document.getElementById('flr');if(!walk){chev.visible=false;if(fe)fe.style.display='none';return;}if(fe){const y=cam.position.y-EYE;const F=Object.entries(ELEV).reduce((b,[k,v])=>Math.abs(v-y)<Math.abs(ELEV[b]-y)?k:b,'1F');fe.style.display='block';fe.textContent='📍 '+F+' · 거리뷰';}chev.visible=true;const fy=cam.position.y-EYE+0.03;let n=0;
 for(let k=0;k<8;k++){const a=yaw+k*Math.PI/4;const dir=new THREE.Vector3(-Math.sin(a),0,-Math.cos(a));const fd=freeDist(dir,4);const m=chev.children[k];
  if(fd<2.6){m.visible=false;continue;}m.visible=true;const step=Math.min(3,fd-0.2);m.userData.step=step;m.userData.dir=dir;m.position.copy(cam.position).addScaledVector(dir,2.4).setY(fy);m.rotation.set(-Math.PI/2,0,0);m.rotation.set(-Math.PI/2,0,0);
  m.quaternion.setFromEuler(new THREE.Euler(-Math.PI/2,0,0)).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),a));m.material.opacity=k===0?0.95:0.6;m.scale.setScalar(k===0?1.1:0.8);n++;}}
const ndc=new THREE.Vector2();function pick(e,objs){const b=r.domElement.getBoundingClientRect();ndc.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);rc.setFromCamera(ndc,cam);rc.far=200;return rc.intersectObjects(objs,false);}
function visibleMeshes(){const a=[];const cc=walk?curChunks():null;const tops=walk?(cc.length?cc.map(k=>chunks[k].group):[root]):[root];if(walk&&chunks.site)tops.push(chunks.site.group);for(const t of tops)t.traverseVisible(o=>{if(o.isMesh&&!['glass','glassIn','led'].includes(o.userData.mat)&&!(o.parent&&o.parent.name==='furn'))a.push(o);});return a;}
let hovT=0;function hoverCursor(e){if(!e||!walk){if(cursor.visible){cursor.visible=false;render();}return;}const now=performance.now();if(now-hovT<150)return;hovT=now;
 const h=pick(e,visibleMeshes())[0];if(h&&h.face&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y>0.7&&Math.abs(h.point.y-(cam.position.y-EYE))<0.8){cursor.visible=true;cursor.position.copy(h.point).setY(h.point.y+0.02);}else cursor.visible=false;render();}
function clickAt(e){
 if(!walk){const h=pick(e,visibleMeshes())[0];if(h){let o=h.object,ch=null;while(o){if(o.name&&chunks[o.name])ch=o.name;o=o.parent;}if(ch==='main_porch'||(h.object.isInstancedMesh&&h.object.userData.isDoor)&&false||ch==='main_1F'&&h.point.y<4&&Math.abs(h.point.x-man.porch.x)<6&&Math.abs(-h.point.z-man.porch.n)<2.5)enterLobby();}return;}
 const b_=r.domElement.getBoundingClientRect();let cm=null,cd=55;for(const c of chev.children){if(!c.visible)continue;const v=c.position.clone().project(cam);if(v.z>1)continue;const sx=(v.x+1)/2*b_.width+b_.left,sy=(1-v.y)/2*b_.height+b_.top;const dd=Math.hypot(sx-e.clientX,sy-e.clientY);if(dd<cd){cd=dd;cm=c;}}if(cm){const m=cm;glideTo(cam.position.clone().addScaledVector(m.userData.dir,m.userData.step));return;}
 const hs=pick(e,visibleMeshes().concat(doorIMs.filter(d=>d.parent&&d.parent.visible)));const h=hs[0];if(!h)return;
 if(h.object.userData.isDoor){const d=h.object.userData.doors[h.instanceId];openDoor(d,true);return;}
 const nY=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld).y:0;
 if(nY>0.7&&Math.abs(h.point.y-(cam.position.y-EYE))<2.0)glideTo(h.point.clone().setY(h.point.y+EYE));
 else{const p=h.point.clone().setY(cam.position.y);const dir=p.clone().sub(cam.position);const L=Math.max(0,dir.length()-0.8);glideTo(cam.position.clone().addScaledVector(dir.normalize(),L));}}
function enterLobby(){curFloor='1F';applyFloor();const p=man.porch;for(const im of doorIMs)for(const d of im.userData.doors)if(d.ext&&d.c==='main_1F'&&d.tgt===0){d.tgt=Math.PI/2*0.95;d.from=0;d.t0=performance.now();}loop();const dx=p.door??(p.x-2.45);setWalk(true,[dx,EYE,-(p.n-4)],0);setTimeout(()=>glideTo(new THREE.Vector3(dx,EYE,-(p.n+3.2)),true),600);}
window.__enterLobby=enterLobby;window.__clickAt=(x,y)=>clickAt({clientX:x,clientY:y});
addEventListener('keydown',e=>{if(walk&&(e.code==='Enter'||e.code==='Space')){const d=nearestDoor();if(d)openDoor(d,true);}});
const J=document.getElementById('joy'),Jk=J.querySelector('i');let jid=null,jc=null;
J.addEventListener('pointerdown',e=>{jid=e.pointerId;const b=J.getBoundingClientRect();jc=[b.left+b.width/2,b.top+b.height/2];J.setPointerCapture(e.pointerId);e.stopPropagation();});
J.addEventListener('pointermove',e=>{if(e.pointerId!==jid)return;let dx=(e.clientX-jc[0])/50,dy=(e.clientY-jc[1])/50;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}joy.x=dx;joy.y=dy;Jk.style.transform=`translate(${dx*40}px,${dy*40}px)`;loop();});
const jend=e=>{if(e.pointerId!==jid)return;jid=null;joy.x=joy.y=0;Jk.style.transform='';};J.addEventListener('pointerup',jend);J.addEventListener('pointercancel',jend);
function setWalk(on,pos,yw){walk=on;camAnim=null;for(const k in KV)KV[k]=0;cam.near=on?0.1:1.0;cam.updateProjectionMatrix();ctl.enabled=!on;document.body.classList.toggle('walk',on);if(on){if(pos)cam.position.set(...pos);if(yw!==undefined)yaw=yw;pitch=-0.22;cam.fov=72;cam.rotation.set(pitch,yaw,0,'YXZ');}else{cam.fov=50;const d=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));ctl.target.copy(cam.position).addScaledVector(d,10);}labelGroup.visible=!on&&showLabels;cursor.visible=false;chev.visible=on;if(on)setTimeout(()=>{colCache=null;updateChevrons();render();},50);applyFloor();cam.updateProjectionMatrix();render();}
const rc=new THREE.Raycaster();
const _sph=new THREE.Spherical(),_off=new THREE.Vector3();
const KV={};function kv(k,dt){const tgt=keys[k]?1:0;KV[k]=(KV[k]||0)+(tgt-(KV[k]||0))*(1-Math.exp(-dt*8));if(KV[k]<0.01&&!tgt)KV[k]=0;return KV[k];}
function orbitKeys(dt){const g=k=>kv(k,dt);const fw=Math.max(g('KeyW'),g('ArrowUp'))-Math.max(g('KeyS'),g('ArrowDown')),rt_=Math.max(g('KeyD'),g('ArrowRight'))-Math.max(g('KeyA'),g('ArrowLeft'));
 const rot=g('KeyQ')-g('KeyE'),tilt=g('KeyR')-g('KeyF'),zm=Math.max(g('Equal'),g('NumpadAdd'))-Math.max(g('Minus'),g('NumpadSubtract'));
 if(!fw&&!rt_&&!rot&&!tilt&&!zm)return false;
 const f=new THREE.Vector3().subVectors(ctl.target,cam.position).setY(0);if(f.lengthSq()<1e-6)f.set(0,0,-1);f.normalize();const r_=new THREE.Vector3(-f.z,0,f.x);
 _off.subVectors(cam.position,ctl.target);_sph.setFromVector3(_off);const sp=Math.max(20,_sph.radius)*0.8*dt;const mv=new THREE.Vector3().addScaledVector(f,fw*sp).addScaledVector(r_,rt_*sp);ctl.target.add(mv);
 _sph.theta-=rot*1.2*dt;_sph.phi=Math.max(ctl.minPolarAngle,Math.min(ctl.maxPolarAngle,_sph.phi-tilt*0.8*dt));_sph.radius=Math.max(ctl.minDistance,Math.min(ctl.maxDistance,_sph.radius*(1-zm*1.1*dt)));
 _off.setFromSpherical(_sph);cam.position.copy(ctl.target).add(_off);cam.lookAt(ctl.target);clampOrbit(false);return true;}
let SITEB=null,lastClampRay=0;let lastD=0,camAnim=null,detailMode=false,userMoved=false;
function ease(k){return k<0.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;}
function animTo(pos,tgt,fov,dur=0.9){camAnim={p0:cam.position.clone(),t0:ctl.target.clone(),f0:cam.fov,p1:pos.clone(),t1:tgt.clone(),f1:fov||cam.fov,s:performance.now(),dur};ctl.enabled=false;loop();}
function stepAnim(){if(!camAnim)return false;const a=camAnim;const k=Math.min(1,(performance.now()-a.s)/1000/a.dur),q=ease(k);cam.position.lerpVectors(a.p0,a.p1,q);ctl.target.lerpVectors(a.t0,a.t1,q);cam.fov=a.f0+(a.f1-a.f0)*q;cam.updateProjectionMatrix();cam.lookAt(ctl.target);if(k>=1){camAnim=null;if(!walk)ctl.enabled=true;ctl.update();}return true;}
function fitView(){const SB=siteBox()||new THREE.Box3(new THREE.Vector3(-90,0,-60),new THREE.Vector3(90,20,100));const c=SB.getCenter(new THREE.Vector3());c.y=0;const sz=SB.getSize(new THREE.Vector3());
 const fov=MOBILE?50:42;const asp=innerWidth/innerHeight;const vf=THREE.MathUtils.degToRad(fov);const hf=2*Math.atan(Math.tan(vf/2)*asp);
 const R=0.5*Math.hypot(sz.x,sz.z)*0.95;const dist=Math.min(ctl.maxDistance,Math.max(R/Math.sin(Math.min(vf,hf)/2)*0.9,60));
 const dir=new THREE.Vector3(-0.55,0.72,0.42).normalize();const tc=new THREE.PerspectiveCamera(fov,asp,1,3000);let d=40;
 const cs=[];for(const x of [SB.min.x,SB.max.x])for(const z of [SB.min.z,SB.max.z])for(const y of [0,18])cs.push(new THREE.Vector3(x,y,z));
 for(;d<600;d*=1.05){tc.position.copy(c).addScaledVector(dir,d);tc.lookAt(c);tc.updateMatrixWorld();if(cs.every(q=>{const v=q.clone().project(tc);return Math.abs(v.x)<0.92&&Math.abs(v.y)<0.8;}))break;}
 return {pos:c.clone().addScaledVector(dir,d),tgt:c,fov};}
function defaultView(animated){detailMode=false;const v=fitView();if(animated)animTo(v.pos,v.tgt,v.fov,1.0);else{cam.position.copy(v.pos);ctl.target.copy(v.tgt);cam.fov=v.fov;cam.updateProjectionMatrix();ctl.update();}}
window.__defaultView=defaultView;
function bldBoxes(){const a=[];for(const k in chunks){const c=chunks[k];if(c.kind==='site'||c.kind==='porch'||!c.group.visible)continue;if(!c.box)c.box=new THREE.Box3().setFromObject(c.group);a.push(c.box);}return a;}
function siteBox(){if(!SITEB){const b=new THREE.Box3();let n=0;for(const k in chunks){const c=chunks[k];if(c.kind==='site'||c.kind==='porch')continue;if(!c.box)c.box=new THREE.Box3().setFromObject(c.group);b.union(c.box);n++;}if(n)SITEB=b.expandByVector(new THREE.Vector3(12,0,12));}return SITEB;}
function clampOrbit(force){if(walk)return;if(walk||camAnim)return;const SB=siteBox();const t=ctl.target;
 if(SB){const old=t.clone();t.x=Math.max(SB.min.x,Math.min(SB.max.x,t.x));t.z=Math.max(SB.min.z,Math.min(SB.max.z,t.z));if(!old.equals(t))cam.position.add(t.clone().sub(old));}
 if(Math.abs(t.y)>1e-6&&!detailMode){const dy=-t.y;t.y=0;cam.position.y+=dy;}
 if(detailMode)t.y=Math.max(0,Math.min(22,t.y));
 {const off=cam.position.clone().sub(t);const sp=new THREE.Spherical().setFromVector3(off);if(lastD&&Math.abs(sp.radius-lastD)>0.05&&!detailMode){const want=1.18-Math.min(1,(sp.radius-45)/215)*0.55;sp.phi+= (want-sp.phi)*0.35;sp.phi=Math.max(ctl.minPolarAngle,Math.min(ctl.maxPolarAngle,sp.phi));cam.position.copy(t).add(off.setFromSpherical(sp));}lastD=sp.radius;}
 const minY=detailMode?2:6;if(cam.position.y<minY)cam.position.y=minY;
 if(force){const now=performance.now();lastClampRay=now;const dir=cam.position.clone().sub(t);const L=dir.length();dir.normalize();rc.set(t.clone().addScaledVector(dir,0.5),dir);rc.far=L;
  const objs=[];for(const k in chunks){const c=chunks[k];if(c.kind==='site'||!c.group.visible)continue;c.group.traverseVisible(o=>{if(o.isMesh&&!(o.parent&&o.parent.name==='furn')&&!['glass','glassIn','line','led'].includes(o.userData.mat))objs.push(o);});}
  const hs=rc.intersectObjects(objs,false);if(hs.length&&!detailMode){// building between target and camera: rise above it smoothly instead of diving in
   const sph=new THREE.Spherical().setFromVector3(cam.position.clone().sub(t));sph.phi=Math.max(ctl.minPolarAngle,sph.phi-0.35);animTo(t.clone().add(new THREE.Vector3().setFromSpherical(sph)),t.clone(),cam.fov,0.5);}}
 guard();}
function guard(){if(walk||camAnim)return;const SB=siteBox();if(!SB)return;const t=ctl.target;const far=SB.distanceToPoint(t)>10;const d=cam.position.distanceTo(t);
 if(far||cam.position.y<1.5||!isFinite(d)){defaultView(true);}}

ctl.addEventListener('change',()=>clampOrbit(false));ctl.addEventListener('end',()=>{setTimeout(()=>{clampOrbit(true);render();},400);});ctl.addEventListener('start',()=>{userMoved=true;camAnim=null;if(ctl._panOffset)ctl._panOffset.set(0,0,0);if(ctl._sphericalDelta)ctl._sphericalDelta.set(0,0,0);if(ctl.getDistance()>40)detailMode=false;});
window.__check=()=>{const p=cam.position;let inWall=false;if(walk){const R=0.12;for(const k of curChunks()){for(const r of WALLS[k].r)if(p.x>r[0]+R&&p.x<r[2]-R&&-p.z>r[1]+R&&-p.z<r[3]-R)inWall=true;}}else{for(const b of bldBoxes()){if(b.containsPoint(p)&&!b.containsPoint(ctl.target))inWall=true;}}return {y:p.y,walk,inWall,below:p.y<0.3};};

function colliders(){const a=[];for(const k in chunks){const g=chunks[k].group;if(!g.visible)continue;g.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.visible&&!['glass','glassIn','led','ceil','line'].includes(o.userData.mat)&&!(o.parent&&o.parent.name==='furn'))a.push(o);});}for(const im of doorIMs)if(im.parent&&im.parent.visible)a.push(im);return a;}
let colCache=null,colT=0;
function blocked(dir,dist){return freeDist(dir,dist+0.1)<dist;}
function blockedOld(dir,dist){const now=performance.now();if(!colCache||now-colT>1500){colCache=colliders();colT=now;}const d=dir.clone().normalize();for(const h of [-1.1,-0.5,0]){rc.set(cam.position.clone().add(new THREE.Vector3(0,h,0)),d);rc.far=dist+0.35;if(rc.intersectObjects(colCache,false).length)return true;}return false;}
function okStep(p){const feet=cam.position.y-EYE;const sY=surfaceAt(p.x,-p.z,feet);if(sY<feet-0.6)return false;for(const st of STAIRS){if(!chunks[st.bld+'_'+st.floor])continue;for(const f of st.flights){f.run=st.run;if(inR(f,p.x,-p.z,0.15)){const y=flightY(f,p.x,-p.z);if(y>sY+0.45&&y<sY+2.1)return false;}}}return true;}
function tryMove(mv){const L=mv.length();if(!L)return;const ok=v=>!blocked(v,v.length())&&okStep(cam.position.clone().add(v));if(ok(mv)){cam.position.add(mv);return;}const ax=new THREE.Vector3(mv.x,0,0),az=new THREE.Vector3(0,0,mv.z);if(Math.abs(mv.x)>1e-6&&ok(ax))cam.position.add(ax);else if(Math.abs(mv.z)>1e-6&&ok(az))cam.position.add(az);}
window.__walkState=()=>({pos:cam.position.toArray(),yaw,pitch,fov:cam.fov,walk,target:ctl.target.toArray(),chev:chev.children.filter(c=>c.visible).map(c=>{const v=c.position.clone().project(cam);return [c.userData.chev,(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]})});window.__proj=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).project(cam);return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight,v.z];};
const clock=new THREE.Clock();let looping=false;
function step(){const dt=Math.min(clock.getDelta(),0.25);let moving=false;
 if(walk){const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),rt=new THREE.Vector3(-f.z,0,f.x);let mf=-joy.y,mr=joy.x;if(glide){const k=Math.min(1,(performance.now()-glide.t0)/1000/glide.dur),q=k*k*(3-2*k);{const y_=cam.position.y,prev=cam.position.clone();cam.position.lerpVectors(glide.from,glide.to,q);cam.position.y=y_;if(!okStep(cam.position)){cam.position.copy(prev);glide=null;}}if(k>=1)glide=null;moving=true;}
  if(keys.KeyW||keys.ArrowUp)mf+=1;if(keys.KeyS||keys.ArrowDown)mf-=1;if(keys.KeyD||keys.ArrowRight)mr+=1;if(keys.KeyA||keys.ArrowLeft)mr-=1;if(keys.KeyQ){yaw+=1.6*dt;moving=true;}if(keys.KeyE){yaw-=1.6*dt;moving=true;}if(keys.KeyR){pitch=Math.min(1.2,pitch+1.2*dt);moving=true;}if(keys.KeyF){pitch=Math.max(-1.2,pitch-1.2*dt);moving=true;}if(keys.Equal||keys.NumpadAdd){cam.fov=Math.max(30,cam.fov-40*dt);cam.updateProjectionMatrix();moving=true;}if(keys.Minus||keys.NumpadSubtract){cam.fov=Math.min(90,cam.fov+40*dt);cam.updateProjectionMatrix();moving=true;}
  const sp=(keys.ShiftLeft?6:2.6)*dt;if(mf||mr){const mv=new THREE.Vector3().addScaledVector(f,mf*sp).addScaledVector(rt,mr*sp);tryMove(mv);moving=true;}{const feet=cam.position.y-EYE;const sY=surfaceAt(cam.position.x,-cam.position.z,feet);const ty=sY+EYE;if(Math.abs(ty-cam.position.y)>0.002){cam.position.y+=(ty>cam.position.y?1:Math.min(1,dt*10))*(ty-cam.position.y);moving=true;}
  const fN=Object.entries(ELEV).filter(([k,v])=>v<=sY+0.3).sort((a,b)=>b[1]-a[1])[0];if(fN&&fN[0]!==curFloor){curFloor=fN[0];applyFloor();colCache=null;}}
  cam.rotation.set(pitch,yaw,0,'YXZ');}
 else{if(stepAnim())moving=true;else{if(orbitKeys(dt))moving=true;if(ctl.update())moving=true;if(ctl._panOffset&&ctl._panOffset.lengthSq()>1e-6)moving=true;if(!detailMode&&!camAnim&&Math.abs(ctl.target.y)>0.01){const dy=ctl.target.y;ctl.target.y=0;cam.position.y-=dy;ctl.update();}if(!detailMode&&!camAnim&&cam.position.y<6){cam.position.y=6;ctl.update();}}}
 if(animDoors(dt))moving=true;if(walk){const key=cam.position.toArray().map(v=>v.toFixed(1)).join()+(yaw).toFixed(1);if(key!==chev.userData.key&&!glide){chev.userData.key=key;updateChevrons();}}
 r.render(scene,cam);return moving;}
function loop(){if(looping)return;looping=true;clock.getDelta();const tick=()=>{const mv=step();if(mv||jid!==null||glide||camAnim||Object.values(KV).some(v=>v>0.01)||Object.values(keys).some(Boolean))requestAnimationFrame(tick);else{looping=false;}};requestAnimationFrame(tick);}
function render(){if(SHOT){r.render(scene,cam);return;}loop();}
ctl.addEventListener('start',loop);
// ---------- views ----------
const VIEWS={bird:()=>{setWalk(false);defaultView(!SHOT);return 'done';},
 front:()=>{setWalk(false);const p=man.porch;cam.fov=72;cam.position.set(p.x,1.6,-(p.n)+24);ctl.target.set(p.x,9,-(p.n)-3);},
 courtyard:()=>{setWalk(false);cam.fov=55;cam.position.set(40,25,40);ctl.target.set(0,6,-15);}};
window.setView=v=>{if(v!=='bird'){detailMode=true;}const pp=cam.position.clone(),pt=ctl.target.clone(),pf=cam.fov;if(VIEWS[v]()==='done'){render();return;}
 if(!SHOT&&!walk){const P=cam.position.clone(),T_=ctl.target.clone(),F=cam.fov;cam.position.copy(pp);ctl.target.copy(pt);cam.fov=pf;animTo(P,T_,F,0.9);}else{cam.updateProjectionMatrix();ctl.update();}render();};
function roomFocus(l){const fl=l.floor==='site'?'all':(l.floor==='roof'?'all':l.floor);curFloor=fl;applyFloor();
 if(l.room&&l.type&&l.type!=='poi'){const [x0,n0,x1,n1]=l.room;const e=l.pos[1];const alongX=(x1-x0)>=(n1-n0);
  // stand at back, look to front
  if(alongX)setWalk(true,[x1-1.0,e+1.55,-(n0+n1)/2+((n1-n0)/2-1.2)],Math.PI/2-0.35);else setWalk(true,[(x0+x1)/2+((x1-x0)/2-1.2),e+1.55,-(n0+1.0)],0.35);}
 else{setWalk(false);detailMode=true;const T_=new THREE.Vector3(l.pos[0],l.pos[1],-l.pos[2]),P=new THREE.Vector3(l.pos[0]+22,l.pos[1]+24,-l.pos[2]+22);if(SHOT){cam.fov=50;ctl.target.copy(T_);cam.position.copy(P);cam.updateProjectionMatrix();ctl.update();}else animTo(P,T_,50,0.9);}
 render();closePanel();}
window.roomFocus=roomFocus;window.chunksDbg=chunks;
// ---------- UI ----------
const fl=document.getElementById('floors');FLOORS.forEach(f=>{const b=document.createElement('button');b.textContent=f==='all'?'전체':f;b.dataset.f=f;b.onclick=()=>{curFloor=f;applyFloor();if(f!=='all'&&!walk){ctl.target.set(0,ELEV[f],10);}};fl.appendChild(b);});
document.getElementById('cut').onclick=e=>{cut=!cut;e.target.classList.toggle('on',cut);applyFloor();};
document.getElementById('lbl').onclick=e=>{showLabels=!showLabels;e.target.classList.toggle('on',showLabels);applyFloor();};
document.getElementById('walkbtn').onclick=()=>{if(walk)setWalk(false);else{const t=ctl.target;const e=curFloor==='all'?0:ELEV[curFloor];setWalk(true,[t.x,e+1.55,t.z],yaw);}};
document.getElementById('home').onclick=()=>{curFloor='all';applyFloor();setView('bird');};
document.getElementById('front').onclick=()=>{curFloor='all';applyFloor();setView('front');};
const panel=document.getElementById('panel'),srch=document.getElementById('q'),res=document.getElementById('res');
document.getElementById('jump').onclick=()=>{panel.classList.toggle('open');srch.focus();fill();};
function closePanel(){panel.classList.remove('open');}
function fill(){const q=srch.value.trim();res.innerHTML='';const groups={};
 man.labels.filter(l=>!l.name.startsWith('계단')&&(!q||l.name.includes(q)||l.bldName.includes(q))).forEach(l=>{const k=l.bldName+' · '+(l.floor==='site'?'외부':l.floor==='roof'?'지붕':l.floor);(groups[k]=groups[k]||[]).push(l);});
 for(const k in groups){const h=document.createElement('h4');h.textContent=k;res.appendChild(h);groups[k].forEach(l=>{const b=document.createElement('button');b.textContent=l.name;b.onclick=()=>roomFocus(l);res.appendChild(b);});}}
srch.oninput=fill;
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();r.setSize(innerWidth,innerHeight);sizeLabels();render();});
sizeLabels();setView('bird');applyFloor();
// test hooks
window.__api={setFloor:f=>{curFloor=f;applyFloor();},setWalk,roomFocus,labels:man.labels,render:()=>r.render(scene,cam),cam,ctl,setCut:v=>{cut=v;applyFloor();},info:()=>r.info.render,scene};

// ---------- on-screen pad ----------
document.querySelectorAll('#pad [data-k]').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();e.stopPropagation();keys[k]=true;t0=performance.now();loop();try{b.setPointerCapture(e.pointerId)}catch(_){}};let t0=0;const off=e=>{const el=performance.now()-t0;setTimeout(()=>{keys[k]=false;},Math.max(0,220-el));};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);});
document.getElementById('pReset').onclick=()=>{if(walk){pitch=-0.22;cam.fov=72;cam.updateProjectionMatrix();cam.rotation.set(pitch,yaw,0,'YXZ');render();}else{curFloor='all';applyFloor();defaultView(true);}};
document.getElementById('pDoor').onclick=()=>{if(!walk)return;const d=nearestDoor();if(d)openDoor(d,true);};
window.__camDbg=()=>({detailMode,camAnim:!!camAnim,t:ctl.target.toArray(),p:cam.position.toArray()});window.__wallsAt=(x,n,m=0.8)=>{const o=[];for(const k in WALLS){for(const r of WALLS[k].r||[])if(x>r[0]-m&&x<r[2]+m&&n>r[1]-m&&n<r[3]+m)o.push([k,r]);for(const s of WALLS[k].s||[])o.push(null);}return o.filter(Boolean);};window.__cols=()=>{let n=0;scene.traverse(o=>{if(o.userData.kind==='column')n+=o.count;});return n;};window.__dbgMove=(dx,dz)=>{const v=new THREE.Vector3(dx,0,dz);const p=cam.position.clone().add(v);return {free:freeDist(v,v.length()),ok:okStep(p),surf:surfaceAt(p.x,-p.z,cam.position.y-EYE),cur:curChunks()};};
