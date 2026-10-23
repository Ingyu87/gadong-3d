import * as THREE from 'three';
// Phase 3 site layout (audit C3-C8, D8-D10, D12): 후문 brick annex, 급식실-누리관 green arch passage, lime stair enclosure,
// yellow-framed 급식실 entrance by the mural, vine pergola behind the field, 정보관 link on 2F only + own 1F door ramp,
// blue parking canopy, guard booth styles, 후문 gate frame + crosswalk + purple mural.
const S=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:0.75},o));
function cvT(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
const brickT=()=>cvT(256,256,(x,w,h)=>{x.fillStyle='#d8d0c4';x.fillRect(0,0,w,h);for(let j=0;j<16;j++)for(let i=0;i<9;i++){const r=Math.sin(i*91.3+j*17.7)*999;const f=r-Math.floor(r);x.fillStyle=['#9a4a35','#a8553c','#8c4230','#b2614a'][Math.floor(f*4)];x.fillRect(i*32-(j%2)*16+1,j*16+1,30,14);}});
function txt(s,W,H,fg,bg,font){const t=cvT(1024,Math.round(1024*H/W),(x,w,h)=>{if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h);}x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';x.font=font||`bold ${Math.round(h*0.7)}px NanumGothic, sans-serif`;x.fillText(s,w/2,h/2);});return new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshStandardMaterial({map:t,transparent:!bg,roughness:0.6}));}
export function buildSite3(chunks,WALLS){const s=chunks.site;if(!s)return;const g=new THREE.Group();g.name='site3';
 const box=(m,x0,x1,y0,y1,n0,n1,par)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,n1-n0),m);b.position.set((x0+x1)/2,(y0+y1)/2,-(n0+n1)/2);b.castShadow=b.receiveShadow=true;(par||g).add(b);return b;};
 const SR=WALLS.site=WALLS.site||{e:0,s:[],r:[]};const R=(a,b,c,d)=>SR.r.push([a,b,c,d]);
 const green=S({color:0x3f8a52}),dgreen=S({color:0x2f6b40}),steel=S({color:0x7a8288,metalness:0.6,roughness:0.4}),white=S({color:0xefeee9});
 const brick=brickT();brick.wrapS=brick.wrapT=THREE.RepeatWrapping;
 // C3 후문 brick annex: single storey, green roof, 5 steel doors
 {s.group.traverse(o=>{if(o.isMesh&&/site__(metalPanel|roofMetal)$/.test(o.name))o.visible=false;});const x0=15.6,x1=51.8,n0=31.9,n1=36.8;const bm=S({map:brick.clone()});bm.map.needsUpdate=true;bm.map.repeat.set(12,1.2);
  box(bm,x0,x1,0,3.0,n0,n1);box(green,x0-0.4,x1+0.4,3.0,3.25,n0-0.5,n1+0.4);R(x0,n0,x1,n1);
  const names=['분리수거장','창고','시설관리실','학부모회실','미화원 휴게실'],cols=[0x5b6f7a,0x5b6f7a,0x4d6f8a,0x4d6f8a,0x4d6f8a];
  names.forEach((nm,i)=>{const cx=x0+1.7*1+i*(x1-x0-3.4)/4;box(S({color:cols[i],metalness:0.4,roughness:0.45}),cx-0.75,cx+0.75,0,2.2,n0-0.04,n0);
   const t=txt(nm,1.6,0.3,'#fff','#2b3a55');t.position.set(cx,2.5,-(n0-0.05));t.rotation.y=Math.PI;g.add(t);});}
 // C4 급식실-누리관 green arched covered passage + lime panel stair enclosure
 {const n0=-60.2,n1=-56.6,x0=44,x1=66;const arch=new THREE.Mesh(new THREE.CylinderGeometry(2.0,2.0,x1-x0,24,1,true,-Math.PI/2,Math.PI),S({color:0x4f9a5e,transparent:true,opacity:0.85,side:THREE.DoubleSide,roughness:0.35}));
  arch.rotation.z=Math.PI/2;arch.position.set((x0+x1)/2,2.6,-(n0+n1)/2);arch.scale.set(1,1,0.9);g.add(arch);
  for(let x=x0;x<=x1+0.01;x+=(x1-x0)/6)for(const n of[n0+0.15,n1-0.15]){box(dgreen,x-0.07,x+0.07,0,2.65,n-0.07,n+0.07);}
  const lime=S({color:0xb8d84a,transparent:true,opacity:0.92,roughness:0.5});
  box(lime,40.2,40.3,0.3,7.0,-26.6,-19.6);box(lime,40.2,43.0,0.3,7.0,-26.7,-26.6);box(lime,40.2,43.0,0.3,7.0,-19.6,-19.5);box(green,40.0,43.2,7.0,7.25,-26.9,-19.3);}
 // C5+D12 yellow-framed glass 급식실 entrance next to the yellow mural (faces the field)
 {const X=44.9,n0=-46.4,n1=-43.0;const yl=S({color:0xf2c230,roughness:0.5}),gl=S({color:0x8fb8c8,roughness:0.08,metalness:0.2,transparent:true,opacity:0.6});
  box(yl,X-0.15,X+0.02,0,2.7,n0-0.18,n0);box(yl,X-0.15,X+0.02,0,2.7,n1,n1+0.18);box(yl,X-0.15,X+0.02,2.52,2.7,n0,n1);box(yl,X-0.15,X+0.02,0,2.52,(n0+n1)/2-0.06,(n0+n1)/2+0.06);
  box(gl,X-0.1,X-0.06,0,2.52,n0,n1);box(S({color:0x3a3d40}),X-2.2,X+0.02,2.75,2.9,n0-0.6,n1+0.6);
  const t=txt('급식실',1.8,0.4,'#1f3d6b','#f6cf3c');t.position.set(X-0.17,3.15,-(n0+n1)/2);t.rotation.y=-Math.PI/2;g.add(t);}
 // C6 vine pergola path behind the field (photo 161)
 {const n0=-95.4,n1=-92.4,x0=-28,x1=28;const wood=S({color:0x7a5236}),vine=S({color:0x4e8a3a,roughness:0.95});
  for(let x=x0;x<=x1+0.01;x+=4)for(const n of[n0,n1]){box(wood,x-0.1,x+0.1,0,2.5,n-0.1,n+0.1);R(x-0.12,n-0.12,x+0.12,n+0.12);}
  for(const n of[n0,n1])box(wood,x0-0.3,x1+0.3,2.5,2.68,n-0.1,n+0.1);for(let x=x0;x<=x1+0.01;x+=1)box(wood,x-0.05,x+0.05,2.68,2.78,n0-0.4,n1+0.4);
  const rnd=i=>{const r=Math.sin(i*12.99)*43758.5;return r-Math.floor(r);};for(let i=0;i<70;i++){const x=x0+rnd(i)*(x1-x0),n=n0+rnd(i+99)*(n1-n0);const b=new THREE.Mesh(new THREE.SphereGeometry(0.6+rnd(i+7)*0.6,8,6),vine);b.position.set(x,2.9,-n);b.scale.y=0.45;b.castShadow=true;g.add(b);}
  const pav=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0+1,n1-n0),S({color:0xb7a998}));pav.rotation.x=-Math.PI/2;pav.position.set(0,0.013,-(n0+n1)/2);g.add(pav);}
 // C8 정보관 link: 2F only. Close the 1F and 3F passages (wall + collision), shrink skybridge, 정보관 1F own door with ramp
 {const beige=S({color:0xd9ccb0});for(const[ck,e]of[['main_1F',0],['main_3F',7.2]]){box(beige,-50.2,-47.4,e,e+3.4,-9.42,-9.36);const W=WALLS[ck];if(W)W.r.push([-50.2,-9.6,-47.4,-9.36]);}
  s.group.traverse(o=>{if(o.isMesh&&o.geometry?.parameters&&Math.abs(o.position.y-7.1)<0.01&&Math.abs(o.geometry.parameters.height-7.0)<0.01){o.scale.y=3.6/7.0;o.position.y=5.4;}});
  s.group.traverse(o=>{if(o.isMesh&&o.geometry?.type==='PlaneGeometry'&&Math.abs(o.position.y-8.6)<0.01&&o.position.x<-47&&o.position.x>-50.2&&o.position.z>4&&o.position.z<10)o.visible=false;});
  // ramp + rails at the 정보관 east door (n -16.5..-14.5 at x -42)
  const conc=S({color:0xc2bfb8});const rp=new THREE.Mesh(new THREE.BoxGeometry(5.0,0.06,1.6),conc);rp.position.set(-39.6,0.06,15.5);rp.rotation.z=-Math.atan(0.12/5);g.add(rp);
  for(const n of[-16.35,-14.65]){box(steel,-42.0,-37.1,0.9,0.95,n-0.025,n+0.025);for(let x=-42;x<=-37.1;x+=1.6)box(steel,x-0.02,x+0.02,0,0.92,n-0.02,n+0.02);}}
 // D10 blue translucent parking canopy (west lot)
 {const blue=S({color:0x3d7fd6,transparent:true,opacity:0.55,side:THREE.DoubleSide,roughness:0.3});const x0=-71,x1=-63.5,n0=-12,n1=22;
  box(blue,x0,x1,3.0,3.06,n0,n1);for(let n=n0;n<=n1+0.01;n+=(n1-n0)/6){box(steel,x0+0.3,x0+0.5,0,3.0,n-0.1,n+0.1);R(x0+0.28,n-0.12,x0+0.52,n+0.12);}
  for(let n=n0;n<=n1;n+=2.5)box(white,x0+1.2,x1-0.4,0.011,0.02,n,n+0.1);}
 // D8 guard booths: 정문 beige, 후문 brick + green roof + clock
 s.group.traverse(o=>{if(o.name==='guard0'){o.traverse(m=>{if(m.isMesh&&m.material.color&&m.material.color.getHex()===0xeeeeea)m.material=S({color:0xd8c7a3});});}
  if(o.name==='guard1'){const bm=S({map:brick});o.traverse(m=>{if(!m.isMesh||!m.material.color)return;const h=m.material.color.getHex();if(h===0xeeeeea)m.material=bm;else if(h===0x3c4a5a)m.material=green;});
   const ck=new THREE.Mesh(new THREE.CircleGeometry(0.28,24),S({map:cvT(128,128,(x,w,h)=>{x.fillStyle='#fff';x.beginPath();x.arc(64,64,62,0,7);x.fill();x.strokeStyle='#222';x.lineWidth=6;x.stroke();x.lineWidth=5;x.beginPath();x.moveTo(64,64);x.lineTo(64,24);x.moveTo(64,64);x.lineTo(92,70);x.stroke();})}));ck.position.set(0,2.95,1.42);ck.rotation.y=0;o.add(ck);}});
 // D9 후문: orange/red gate frame, zebra crossing, purple mural strip
 {const X=59.7,N=43.5;const or=S({color:0xe8702a}),rd=S({color:0xc8322c});box(or,X-3.4,X-3.0,0,3.4,N-0.2,N+0.2);box(or,X+3.0,X+3.4,0,3.4,N-0.2,N+0.2);box(rd,X-3.4,X+3.4,3.4,3.75,N-0.25,N+0.25);
  for(let i=0;i<7;i++)box(white,X-3+i*0.9,X-2.55+i*0.9,0.012,0.022,N+1.5,N+5.5);
  const pm=S({map:cvT(1024,128,(x,w,h)=>{x.fillStyle='#7b4fa8';x.fillRect(0,0,w,h);const c=['#f3d34a','#ff9fc8','#9fe0ff','#ffffff'];for(let i=0;i<40;i++){x.fillStyle=c[i%4];x.beginPath();x.arc(i*26+13,h/2+Math.sin(i)*30,10+(i%3)*5,0,7);x.fill();}})});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(12,1.2),pm);m.position.set(X+10,0.9,-(N-0.6));g.add(m);}
 g.userData.kind='photo';s.group.add(g);}
