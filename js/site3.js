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
  box(lime,40.2,40.3,0.3,7.0,-26.6,-19.6);box(lime,40.2,41.6,0.3,7.0,-26.7,-26.6);box(lime,41.6,43.4,3.2,7.0,-26.7,-26.6);box(lime,40.2,43.4,5.4,7.0,-19.6,-19.5);box(lime,43.35,43.4,3.2,7.0,-26.6,-19.6);box(lime,42.3,42.35,3.2,7.0,-26.6,-19.6);box(green,40.0,43.6,7.0,7.25,-26.9,-19.3);
  box(S({color:0xf2c230,roughness:0.5}),43.4,43.7,0.0,8.4,-27.0,-26.7);}
 // C5+D12 yellow-framed glass 급식실 entrance next to the yellow mural (faces the field)
 {const X=44.9,n0=-46.4,n1=-43.0;const yl=S({color:0xf2c230,roughness:0.5}),gl=S({color:0x8fb8c8,roughness:0.08,metalness:0.2,transparent:true,opacity:0.6});
  box(yl,X-0.15,X+0.02,0,2.7,n0-0.18,n0);box(yl,X-0.15,X+0.02,0,2.7,n1,n1+0.18);box(yl,X-0.15,X+0.02,2.52,2.7,n0,n1);box(yl,X-0.15,X+0.02,0,2.52,(n0+n1)/2-0.06,(n0+n1)/2+0.06);
  box(gl,X-0.1,X-0.06,0,2.52,n0,n1);box(S({color:0x3a3d40}),X-2.2,X+0.02,2.75,2.9,n0-0.6,n1+0.6);
  // photo 138: teal glass canopy panel over the approach + lime screen panel on its south side
  {const tg=S({color:0x6fc7c0,transparent:true,opacity:0.5,roughness:0.15,side:THREE.DoubleSide});box(tg,41.0,X-0.15,3.0,3.05,n0-2.6,n1+2.5);box(steel,41.0,X-0.15,2.92,3.0,n0-2.6,n0-2.5);box(steel,41.0,X-0.15,2.92,3.0,n1+2.4,n1+2.5);
   for(const n of[n0-2.55,n1+2.45])box(steel,41.0,41.12,0,3.0,n-0.06,n+0.06);R(40.95,n0-2.62,41.17,n0-2.48);R(40.95,n1+2.38,41.17,n1+2.52);
   box(S({color:0xb8d84a,roughness:0.5}),41.15,X-0.2,0,2.6,n0-2.62,n0-2.5);R(41.15,n0-2.65,X-0.2,n0-2.47);}
  const t=txt('급식실',1.8,0.4,'#1f3d6b','#f6cf3c');t.position.set(X-0.17,3.15,-(n0+n1)/2);t.rotation.y=-Math.PI/2;g.add(t);}
 // C6 vine pergola path behind the field (photo 161)
 {const n0=-95.4,n1=-92.4,x0=-28,x1=28;const wood=S({color:0x7a5236}),vine=S({color:0x4e8a3a,roughness:0.95});
  for(let x=x0;x<=x1+0.01;x+=4)for(const n of[n0,n1]){box(wood,x-0.1,x+0.1,0,2.5,n-0.1,n+0.1);R(x-0.12,n-0.12,x+0.12,n+0.12);}
  for(const n of[n0,n1])box(wood,x0-0.3,x1+0.3,2.5,2.68,n-0.1,n+0.1);for(let x=x0;x<=x1+0.01;x+=1)box(wood,x-0.05,x+0.05,2.68,2.78,n0-0.4,n1+0.4);
  const rnd=i=>{const r=Math.sin(i*12.99)*43758.5;return r-Math.floor(r);};for(let i=0;i<70;i++){const x=x0+rnd(i)*(x1-x0),n=n0+rnd(i+99)*(n1-n0);const b=new THREE.Mesh(new THREE.SphereGeometry(0.6+rnd(i+7)*0.6,8,6),vine);b.position.set(x,2.9,-n);b.scale.y=0.45;b.castShadow=true;g.add(b);}
  const pav=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0+1,n1-n0),S({color:0xb7a998}));pav.rotation.x=-Math.PI/2;pav.position.set(0,0.013,-(n0+n1)/2);g.add(pav);}
 // C8 정보관 link: 2F only. Close the 1F and 3F passages (wall + collision), shrink skybridge, 정보관 1F own door with ramp
 {const beige=S({color:0xd9ccb0});for(const[ck,e]of[['main_3F',7.2]]){box(beige,-50.2,-47.4,e,e+3.4,-9.42,-9.36);const W=WALLS[ck];if(W)W.r.push([-50.2,-9.6,-47.4,-9.36]);}
  // 1F under the link is an open outdoor walk-through (main_1F.glb walls cut there); close the main building's 1F end at n -4.4 instead
  {const brk=S({color:0x8e4a3a,roughness:0.9});box(brk,-50.25,-47.2,0,2.9,-4.52,-4.38);const W=WALLS.main_1F;if(W){W.r.push([-50.25,-4.55,-47.2,-4.35]);for(const x of[-49.95,-47.55])for(const n of[-9.45,-4.55])W.r.push([x-0.15,n-0.15,x+0.15,n+0.15]);}}
  s.group.traverse(o=>{if(o.isMesh&&o.geometry?.parameters&&Math.abs(o.position.y-7.1)<0.01&&Math.abs(o.geometry.parameters.height-7.0)<0.01){o.scale.y=3.6/7.0;o.position.y=5.4;}});
  s.group.traverse(o=>{if(o.isMesh&&o.geometry?.type==='PlaneGeometry'&&Math.abs(o.position.y-8.6)<0.01&&o.position.x<-47&&o.position.x>-50.2&&o.position.z>4&&o.position.z<10)o.visible=false;});
  // ramp + rails at the 정보관 east door (n -16.5..-14.5 at x -42)
  const conc=S({color:0xc2bfb8});const rp=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.06,4.0),conc);rp.position.set(-41.67,0.06,19.2);rp.rotation.x=-Math.atan(0.12/4);g.add(rp);
  for(const x of[-42.5,-40.85]){box(steel,x-0.025,x+0.025,0.9,0.95,-21.3,-17.3);for(let n=-21.3;n<=-17.2;n+=1.35)box(steel,x-0.02,x+0.02,0,0.92,n-0.02,n+0.02);}}
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

// Phase 4: D2 green roof lettering, D11 playground, D6 장미홀 quilted brown door surrounds (D13 정보관 striped tower + lettering already present)
export function buildSite4(chunks,WALLS){const s=chunks.site;if(!s)return;const g=new THREE.Group();g.name='site4';
 const box=(m,x0,x1,y0,y1,n0,n1,par)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,n1-n0),m);b.position.set((x0+x1)/2,(y0+y1)/2,-(n0+n1)/2);b.castShadow=b.receiveShadow=true;(par||g).add(b);return b;};
 const SR=WALLS.site=WALLS.site||{e:0,s:[],r:[]};const R=(a,b,c,d)=>SR.r.push([a,b,c,d]);
 const rf=chunks.main_roof?.group;if(rf)rf.traverse(o=>{if(o.userData?.kind==='roofdeco')o.traverse(m=>{if(m.isMesh&&m.material.map&&m.geometry.parameters?.width===1.6&&m.material.transparent&&!m.userData.logo){m.material=m.material.clone();m.material.color.set(0x1f8a3c);}});});
 // playground beside the 정문 보안관실 (photos 48,99,156,166,221): rainbow rope dome, slide tower, tyre border, rubber floor
 {const cx=-49,cn=-74;const rub=new THREE.Mesh(new THREE.CircleGeometry(6.5,40),S({color:0x4c8bd0,roughness:0.95}));rub.rotation.x=-Math.PI/2;rub.position.set(cx,0.02,-cn);g.add(rub);
  const tyre=S({color:0x1d1d1f,roughness:0.9});const tg=new THREE.TorusGeometry(0.32,0.12,8,16);for(let i=0;i<44;i++){const a=i/44*Math.PI*2;const t=new THREE.Mesh(tg,tyre);t.position.set(cx+Math.cos(a)*6.6,0.3,-(cn+Math.sin(a)*6.6));t.rotation.y=-a;g.add(t);}
  const RB=[0xe53935,0xfb8c00,0xfdd835,0x43a047,0x1e88e5,0x3949ab,0x8e24aa];const dx=cx-2.2;
  for(let i=0;i<12;i++){const a=i/12*Math.PI;const tr=new THREE.Mesh(new THREE.TorusGeometry(2.4,0.035,6,40,Math.PI),S({color:RB[i%7]}));tr.position.set(dx,0,-cn);tr.rotation.y=a;g.add(tr);}
  for(let k=1;k<4;k++){const y=k*0.6,r=Math.sqrt(2.4*2.4-y*y);const tr=new THREE.Mesh(new THREE.TorusGeometry(r,0.03,6,40),S({color:RB[(k*2)%7]}));tr.rotation.x=Math.PI/2;tr.position.set(dx,y,-cn);g.add(tr);}
  R(dx-2.3,cn-2.3,dx+2.3,cn+2.3);
  const tx=cx+3,tn=cn+1;const pm=S({color:0xf2f2f2,metalness:0.4}),yl=S({color:0xf6c935}),rd=S({color:0xd8402e});
  for(const[a,b]of[[-0.9,-0.9],[0.9,-0.9],[-0.9,0.9],[0.9,0.9]])box(pm,tx+a-0.06,tx+a+0.06,0,3.4,tn+b-0.06,tn+b+0.06);
  box(yl,tx-0.95,tx+0.95,1.5,1.62,tn-0.95,tn+0.95);const rf2=new THREE.Mesh(new THREE.ConeGeometry(1.45,1.0,4),rd);rf2.position.set(tx,3.9,-tn);rf2.rotation.y=Math.PI/4;g.add(rf2);
  const sl=new THREE.Mesh(new THREE.BoxGeometry(0.75,0.06,3.4),yl);sl.position.set(tx+0.0,0.8,-(tn-2.3));sl.rotation.x=-Math.atan(1.5/3.2);g.add(sl);R(tx-1.0,tn-1.0,tx+1.0,tn+1.0);}
 // 장미홀 brown quilted leather door surrounds (photos 23,32,278)
 {const qt=document.createElement('canvas');qt.width=qt.height=128;const x=qt.getContext('2d');x.fillStyle='#6b3a24';x.fillRect(0,0,128,128);x.strokeStyle='#4a2616';x.lineWidth=3;for(let i=-128;i<256;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i+128,128);x.stroke();x.beginPath();x.moveTo(i+128,0);x.lineTo(i,128);x.stroke();}x.fillStyle='#c9a35a';for(let i=0;i<128;i+=32)for(let j=0;j<128;j+=32){x.beginPath();x.arc(i+16,j+16,2.5,0,7);x.fill();}
  const t=new THREE.CanvasTexture(qt);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,3);const qm=S({map:t,roughness:0.6});const gold=S({color:0xc9a35a,metalness:0.7,roughness:0.3});
  for(const[x0,x1]of[[-51.0,-49.25],[-48.65,-46.9]])for(const n of[-19.12,-18.73]){box(gold,x0-0.09,x0,0,2.4,n-0.03,n+0.03);box(gold,x1,x1+0.09,0,2.4,n-0.03,n+0.03);box(gold,x0-0.09,x1+0.09,2.3,2.4,n-0.03,n+0.03);}
  const tp=txt('장미홀',0.9,0.22,'#1d1d1d','#f4f4f2');tp.position.set(-48.95,2.85,18.71);tp.rotation.y=Math.PI;g.add(tp);}
 s.group.add(g);}
// Phase 5 interiors: D3 lobby fish tank/TV/독도 board/교훈 board, D4 office corridor wood windows + blinds + frosted glass,
// D5 나래 corridor purple/yellow walls + yellow door frames, D7 per-floor colour frames at the toilet fronts
export function buildInterior5(chunks,WALLS){const S2=S;
 const add=(ck,f)=>{const c=chunks[ck];if(!c)return;const g=new THREE.Group();g.userData.kind='photo';f(g,c.elev??0);c.group.add(g);};
 const mk=(g)=>(m,x0,x1,y0,y1,n0,n1)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,n1-n0),m);b.position.set((x0+x1)/2,(y0+y1)/2,-(n0+n1)/2);b.receiveShadow=true;g.add(b);return b;};
 const pl=(g,m,w,h,x,y,n,ry)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);p.position.set(x,y,-n);p.rotation.y=ry;g.add(p);return p;};
 add('main_1F',(g)=>{const box=mk(g);const W=WALLS.main_1F;
  // lobby (x 2.55..6.65, n 13..20.2)
  const cab=S2({color:0x5a3d2b}),gl=S2({color:0x7fc8e0,transparent:true,opacity:0.45,roughness:0.05}),wat=S2({color:0x2f8fc0,transparent:true,opacity:0.55,roughness:0.1,emissive:0x0a3550});
  box(cab,6.15,6.65,0,0.8,14.6,16.8);box(wat,6.2,6.6,0.82,1.38,14.65,16.75);box(gl,6.17,6.63,0.8,1.45,14.62,16.78);box(S2({color:0x222}),6.15,6.65,1.45,1.52,14.6,16.8);
  const fish=S2({color:0xff8a2a,emissive:0x552200});for(let i=0;i<6;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,4),fish);f.scale.set(1.8,1,0.6);f.position.set(6.4,0.95+(i%3)*0.13,-(14.9+i*0.3));g.add(f);}
  W&&W.r.push([6.15,14.6,6.65,16.8]);
  const tv=S2({color:0x111,roughness:0.2});box(tv,2.56,2.62,1.6,2.35,18.4,19.75);pl(g,S2({color:0x1e4f8a,emissive:0x0d2a4a}),1.25,0.65,2.63,1.975,19.075,Math.PI/2);
  const dok=cvT(512,384,(x,w,h)=>{x.fillStyle='#2d6fb0';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='bold 54px NanumGothic, sans-serif';x.textAlign='center';x.fillText('독도 학습관',w/2,70);x.fillStyle='#5aa65a';x.beginPath();x.ellipse(w*0.4,h*0.62,70,50,0,0,7);x.fill();x.beginPath();x.ellipse(w*0.65,h*0.6,50,38,0,0,7);x.fill();x.fillStyle='#fff';x.font='28px NanumGothic, sans-serif';x.fillText('동도 · 서도',w/2,h-30);});
  pl(g,S2({map:dok}),2.0,1.5,6.63,1.6,18.6,-Math.PI/2);
  const kh=cvT(512,512,(x,w,h)=>{x.fillStyle='#f4ead2';x.fillRect(0,0,w,h);x.strokeStyle='#8a5a2b';x.lineWidth=18;x.strokeRect(9,9,w-18,h-18);x.fillStyle='#5a3d22';x.textAlign='center';x.font='bold 64px NanumGothic, sans-serif';x.fillText('교 훈',w/2,110);x.font='bold 52px NanumGothic, sans-serif';['고운 마음','바른 행동','큰 꿈'].forEach((t,i)=>x.fillText(t,w/2,210+i*90));});
  pl(g,S2({map:kh}),1.3,1.3,2.32,1.7,14.6,Math.PI/2);
  // office corridor windows (face n 20.47, x -33.5..-11) between doors
  const wood=S2({color:0x8a5a34}),frost=S2({color:0xe8eef0,transparent:true,opacity:0.85,roughness:0.3}),blind=S2({map:cvT(64,64,(x,w,h)=>{x.fillStyle='#f3f1ea';x.fillRect(0,0,w,h);x.fillStyle='#cfcabd';for(let y=0;y<h;y+=6)x.fillRect(0,y,w,1.5);})});
  const doors=[[-31.25,-30.4],[-27.95,-27.05],[-22.25,-21.4],[-18.95,-18.05],[-13.25,-12.4]];let a=-33.3;
  for(const[d0,d1]of[...doors,[-11.2,-11.2]]){const b=d0-0.35;if(b-a>1.2){const n=20.47;box(wood,a,b,1.15,1.22,n,n+0.06);box(wood,a,b,2.28,2.35,n,n+0.06);box(wood,a-0.06,a,1.15,2.35,n,n+0.06);box(wood,b,b+0.06,1.15,2.35,n,n+0.06);
    const k=Math.max(1,Math.round((b-a)/1.4));for(let i=1;i<k;i++){const x=a+i*(b-a)/k;box(wood,x-0.03,x+0.03,1.22,2.28,n,n+0.06);}
    pl(g,blind,b-a,0.6,(a+b)/2,1.95,n+0.02,0);pl(g,frost,b-a,0.45,(a+b)/2,1.45,n+0.025,0);}a=d1+0.35;}
  // 나래 corridor (classroom wall face x -49.98, n -2..22): purple dado, yellow upper stripe, yellow door frames
  const pur=S2({color:0x8e6bc4}),yel=S2({color:0xf2c230});const nd=[[-2.9,-2.0],[2.75,3.65],[6.1,7.0],[11.75,12.65],[15.1,16.0],[20.75,21.65]];let b0=-1.6;
  for(const[d0,d1]of nd.slice(1)){if(d0-0.2-b0>0.4){pl(g,pur,d0-0.2-b0,1.0,-49.97,0.55,(b0+d0-0.2)/2,Math.PI/2);pl(g,yel,d0-0.2-b0,0.18,-49.97,1.25,(b0+d0-0.2)/2,Math.PI/2);}b0=d1+0.2;}
  for(const[d0,d1]of nd){box(yel,-49.98,-49.9,0,2.2,d0-0.12,d0);box(yel,-49.98,-49.9,0,2.2,d1,d1+0.12);box(yel,-49.98,-49.9,2.2,2.32,d0-0.12,d1+0.12);}});
 // toilet fronts: per-floor colour frame around the recess (x -42..-36, BN 18.63)
 const TC={'1F':0xf2c230,'2F':0xe0457b,'3F':0x8cc63f,'4F':0x2e9a5a,'5F':0x4fa8e0};
 for(const f in TC)add('main_'+f,(g,e)=>{const box=mk(g);const m=S2({color:TC[f]});const n0=19.0,n1=19.12;box(m,-42.2,-35.9,e+2.62,e+2.8,n0,n1);box(m,-42.2,-42.0,e,e+2.8,n0,n1);box(m,-36.1,-35.9,e,e+2.8,n0,n1);});}
