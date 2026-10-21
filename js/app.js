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
 glass:new THREE.MeshPhysicalMaterial({color:0x2f6680,roughness:0.05,metalness:0.2,transparent:true,opacity:0.85,envMapIntensity:1.6,side:THREE.DoubleSide,depthWrite:false}),
 glassIn:new THREE.MeshPhysicalMaterial({color:0xcfe6ee,roughness:0.05,transparent:true,opacity:0.25,depthWrite:false,side:THREE.DoubleSide}),
 frost:std({color:0xdde9ee,roughness:0.3,transparent:true,opacity:0.8}),green:std({color:0x3b6b55,roughness:0.55,metalness:0.25}),roofMetal:std({color:0x3e6e58,roughness:0.5,metalness:0.3}),
 stone:tri(std({map:T.noise('#d9cdb4',0.07,2),roughness:0.8}),2),slab:std({color:0xe9e8e4}),corrFloor:tri(std({map:T.noise('#cfcac0',0.1,1),roughness:0.35}),1),
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
function decorate(){const s=man.sign;if(s){const g=new THREE.Group();const n=[...s.text];const cx=(s.x0+s.x1)/2;const sp=Math.min(5.4,(s.x1-s.x0)/(n.length+1.5));
 n.forEach((ch,i)=>{const p=textPlane(ch,1.6,1.6,{w:256,h:256,font:'bold 230px NanumGothic, sans-serif'});p.position.set(cx+(i-(n.length-1)/2)*sp+sp*0.6,s.y,-(s.n-0.26));g.add(p);});
 const lg=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshStandardMaterial({map:logoTex(),transparent:true}));lg.position.set(cx-(n.length-1)/2*sp-sp*0.5,s.y,-(s.n-0.26));g.add(lg);
 g.userData.kind='roofdeco';chunks.main_roof?.group.add(g);}
 const p=man.porch;if(p&&chunks.main_porch){const b=textPlane('고운마음 ✿ 바른행동',8.6,0.7,{w:2048,h:160,font:'bold 120px NanumGothic, sans-serif',fg:'#6b5a3e'});b.position.set(p.x,3.75,-(p.n)+0.01);chunks.main_porch.group.add(b);
  const lg=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.8),new THREE.MeshStandardMaterial({map:logoTex(),transparent:true}));lg.position.set(p.x,3.75,-(p.n)+0.02);chunks.main_porch.group.add(lg);}
 (man.gates||[]).forEach(([x,n])=>{const t=textPlane('서울가동초등학교',4.6,0.6,{w:1536,h:200,font:'bold 140px NanumGothic, sans-serif',fg:'#5a4a34'});t.position.set(x,1.3,-n+0.42);chunks.site?.group.add(t);const t2=t.clone();t2.rotation.y=Math.PI;t2.position.z=-n-0.42;chunks.site?.group.add(t2);
  const w=new THREE.Mesh(new THREE.BoxGeometry(4.8,1.6,0.8),M.stone);w.position.set(x,0.8,-n);chunks.site?.group.add(w);});}
const ORDER=c=>c.kind==='site'?0:c.kind==='roof'?2:(c.bld==='main'?1:3);
const list=[...man.chunks].sort((a,b)=>ORDER(a)-ORDER(b)||a.elev-b.elev);
async function loadChunk(c){const g=await loader.loadAsync(c.file);const grp=new THREE.Group();grp.name=c.name;
 g.scene.traverse(o=>{if(o.isMesh){if(!o.geometry.attributes.normal){o.geometry=o.geometry.toNonIndexed();o.geometry.computeVertexNormals();}const n=(o.material&&o.material.name)||'';const mm=M[n]||M.white;o.material=mm;o.castShadow=!MOBILE&&!mm.transparent&&c.kind!=='site';o.receiveShadow=true;o.userData.mat=n;}});
 grp.add(g.scene);const fg=new THREE.Group();fg.name='furn';if(c.kind==='site')fg.add(trees(c.furn));else addFurn(fg,c.furn);grp.add(fg);
 root.add(grp);chunks[c.name]={...c,group:grp};loaded++;prog.textContent=`불러오는 중 ${loaded}/${list.length}`;if(loaded===list.length){prog.style.display='none';decorate();applyFloor();window.__loaded=true;}
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
const ctl=new OrbitControls(cam,r.domElement);ctl.enableDamping=true;ctl.maxPolarAngle=Math.PI*0.495;ctl.minDistance=2;ctl.maxDistance=600;ctl.addEventListener('change',render);
let walk=false,yaw=0,pitch=0;const keys={};const joy={x:0,y:0};
addEventListener('keydown',e=>{keys[e.code]=true;loop();});addEventListener('keyup',e=>keys[e.code]=false);
const look=[0,0];let lookId=null,last=null;
r.domElement.addEventListener('pointerdown',e=>{if(!walk)return;lookId=e.pointerId;last=[e.clientX,e.clientY];});
addEventListener('pointermove',e=>{if(!walk||e.pointerId!==lookId||!last)return;yaw-=(e.clientX-last[0])*0.005;pitch=Math.max(-1.2,Math.min(1.2,pitch-(e.clientY-last[1])*0.005));last=[e.clientX,e.clientY];cam.rotation.set(pitch,yaw,0,'YXZ');render();});
addEventListener('pointerup',e=>{if(e.pointerId===lookId){lookId=null;last=null;}});
r.domElement.addEventListener('wheel',e=>{if(!walk)return;const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));cam.position.addScaledVector(f,-e.deltaY*0.004);render();},{passive:true});
const J=document.getElementById('joy'),Jk=J.querySelector('i');let jid=null,jc=null;
J.addEventListener('pointerdown',e=>{jid=e.pointerId;const b=J.getBoundingClientRect();jc=[b.left+b.width/2,b.top+b.height/2];J.setPointerCapture(e.pointerId);e.stopPropagation();});
J.addEventListener('pointermove',e=>{if(e.pointerId!==jid)return;let dx=(e.clientX-jc[0])/50,dy=(e.clientY-jc[1])/50;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}joy.x=dx;joy.y=dy;Jk.style.transform=`translate(${dx*40}px,${dy*40}px)`;loop();});
const jend=e=>{if(e.pointerId!==jid)return;jid=null;joy.x=joy.y=0;Jk.style.transform='';};J.addEventListener('pointerup',jend);J.addEventListener('pointercancel',jend);
function setWalk(on,pos,yw){walk=on;ctl.enabled=!on;document.body.classList.toggle('walk',on);if(on){if(pos)cam.position.set(...pos);if(yw!==undefined)yaw=yw;pitch=-0.08;cam.fov=72;cam.rotation.set(pitch,yaw,0,'YXZ');}else{cam.fov=50;const d=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));ctl.target.copy(cam.position).addScaledVector(d,10);}labelGroup.visible=!on&&showLabels;applyFloor();cam.updateProjectionMatrix();render();}
const clock=new THREE.Clock();let looping=false;
function step(){const dt=Math.min(clock.getDelta(),0.05);let moving=false;
 if(walk){const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),rt=new THREE.Vector3(-f.z,0,f.x);let mf=-joy.y,mr=joy.x;
  if(keys.KeyW||keys.ArrowUp)mf+=1;if(keys.KeyS||keys.ArrowDown)mf-=1;if(keys.KeyD)mr+=1;if(keys.KeyA)mr-=1;if(keys.ArrowLeft){yaw+=1.6*dt;moving=true;}if(keys.ArrowRight){yaw-=1.6*dt;moving=true;}
  const sp=(keys.ShiftLeft?6:2.6)*dt;if(mf||mr){cam.position.addScaledVector(f,mf*sp).addScaledVector(rt,mr*sp);moving=true;}cam.rotation.set(pitch,yaw,0,'YXZ');}
 else if(ctl.update())moving=true;
 r.render(scene,cam);return moving;}
function loop(){if(looping)return;looping=true;clock.getDelta();const tick=()=>{const mv=step();if(mv||jid!==null||Object.values(keys).some(Boolean))requestAnimationFrame(tick);else{looping=false;}};requestAnimationFrame(tick);}
function render(){if(SHOT){r.render(scene,cam);return;}loop();}
ctl.addEventListener('start',loop);
// ---------- views ----------
const VIEWS={bird:()=>{setWalk(false);cam.fov=42;cam.position.set(-95,120,95);ctl.target.set(0,0,20);},
 front:()=>{setWalk(false);const p=man.porch;cam.fov=72;cam.position.set(p.x,1.6,-(p.n)+24);ctl.target.set(p.x,9,-(p.n)-3);},
 courtyard:()=>{setWalk(false);cam.fov=55;cam.position.set(40,25,40);ctl.target.set(0,6,-15);}};
window.setView=v=>{VIEWS[v]();cam.updateProjectionMatrix();ctl.update();render();};
function roomFocus(l){const fl=l.floor==='site'?'all':(l.floor==='roof'?'all':l.floor);curFloor=fl;applyFloor();
 if(l.room&&l.type&&l.type!=='poi'){const [x0,n0,x1,n1]=l.room;const e=l.pos[1];const alongX=(x1-x0)>=(n1-n0);
  // stand at back, look to front
  if(alongX)setWalk(true,[x1-1.0,e+1.55,-(n0+n1)/2+((n1-n0)/2-1.2)],Math.PI/2-0.35);else setWalk(true,[(x0+x1)/2+((x1-x0)/2-1.2),e+1.55,-(n0+1.0)],0.35);}
 else{setWalk(false);cam.fov=50;ctl.target.set(l.pos[0],l.pos[1],-l.pos[2]);cam.position.set(l.pos[0]+25,l.pos[1]+25,-l.pos[2]+25);cam.updateProjectionMatrix();ctl.update();}
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
window.__api={setFloor:f=>{curFloor=f;applyFloor();},setWalk,roomFocus,labels:man.labels,render:()=>r.render(scene,cam),cam,ctl,setCut:v=>{cut=v;applyFloor();},info:()=>r.info.render};
