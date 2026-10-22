// Special rooms + playground dressing matched to user photos (refs/rooms/*)
import * as THREE from 'three';
const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;};
const S=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughness:0.8},o));
const woodTex=(base,planks=8)=>cv(512,512,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<planks;i++){const y=i*h/planks;x.fillStyle=`rgba(${Math.random()<.5?'255,240,210':'60,35,10'},${0.05+Math.random()*0.08})`;x.fillRect(0,y,w,h/planks);x.fillStyle='rgba(60,35,15,0.25)';x.fillRect(0,y,w,1.5);}for(let i=0;i<300;i++){x.strokeStyle=`rgba(80,50,20,${Math.random()*0.08})`;x.beginPath();const y=Math.random()*h;x.moveTo(0,y);x.bezierCurveTo(w/3,y+4,w*2/3,y-4,w,y);x.stroke();}});
function rep(t,a,b){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(a,b);return t;}
// helpers -------------------------------------------------------------
function Room(group,e){const parts=[];const rects=[];
 const box=(m,x0,x1,n0,n1,y0,y1,ry=0)=>{const g=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,n1-n0),m);g.position.set((x0+x1)/2,e+(y0+y1)/2,-(n0+n1)/2);g.rotation.y=ry;g.castShadow=g.receiveShadow=true;group.add(g);return g;};
 const plane=(m,x0,x1,n0,n1,y)=>{const g=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,n1-n0),m);g.rotation.x=y>1.5?Math.PI/2:-Math.PI/2;g.position.set((x0+x1)/2,e+y,-(n0+n1)/2);g.receiveShadow=true;group.add(g);return g;};
 // vertical panel on wall line: ax 'x' => panel spans x at n, facing s (+1 = towards +n)
 const wallp=(m,ax,a0,a1,c,y0,y1,face)=>{const g=new THREE.Mesh(new THREE.PlaneGeometry(a1-a0,y1-y0),m);if(ax==='x'){g.position.set((a0+a1)/2,e+(y0+y1)/2,-c);g.rotation.y=face>0?Math.PI:0;}else{g.position.set(c,e+(y0+y1)/2,-(a0+a1)/2);g.rotation.y=face>0?Math.PI/2:-Math.PI/2;}group.add(g);return g;};
 // instanced furniture: parts [[w,h,d,dx,dy,dn,mat]], at [[x,n,ry]]
 const inst=(pp,at)=>{const M=new THREE.Matrix4(),R=new THREE.Matrix4(),P=new THREE.Matrix4();for(const[w,h,d,dx,dy,dn,m]of pp){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(w,h,d),m,at.length);at.forEach(([x,n,ry=0],i)=>{M.makeTranslation(x,e,-n);R.makeRotationY(ry);P.makeTranslation(dx,dy,-dn);im.setMatrixAt(i,M.clone().multiply(R).multiply(P));});im.castShadow=true;im.receiveShadow=true;group.add(im);}};
 return {box,plane,wallp,inst,rects};}
const text=(t,w,h,{font='bold 120px NanumGothic, sans-serif',fg='#fff',bg=null,cw=1024,ch=160}={})=>{const tx=cv(cw,ch,(x,W,H)=>{if(bg){x.fillStyle=bg;x.fillRect(0,0,W,H);}x.fillStyle=fg;x.font=font;x.textAlign='center';x.textBaseline='middle';x.fillText(t,W/2,H/2);});return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tx,transparent:!bg,roughness:0.7}));};
const chairParts=(seatM,legM,backM=seatM)=>[[0.42,0.04,0.4,0,0.44,0,seatM],[0.42,0.34,0.04,0,0.68,-0.2,backM],[0.03,0.44,0.03,-0.18,0.22,-0.17,legM],[0.03,0.44,0.03,0.18,0.22,-0.17,legM],[0.03,0.44,0.03,-0.18,0.22,0.17,legM],[0.03,0.44,0.03,0.18,0.22,0.17,legM]];
export function buildRooms(chunks,WALLS,logoTex,man){
 const add=(ck,f,sx)=>{const c=chunks[ck];if(!c)return;const g=new THREE.Group();g.name='room_'+ck;const e=(man.chunks.find(q=>q.name===ck)||{}).elev||0;const R=Room(g,e);f(R,e);
  if(sx){const[x0,k]=sx;g.scale.x=k;g.position.x=x0*(1-k);R.rects.forEach(r=>{r[0]=x0+(r[0]-x0)*k;r[2]=x0+(r[2]-x0)*k;});}c.group.add(g);if(WALLS[ck])WALLS[ck].r.push(...R.rects);};
 const INFO_SX=[-53.9,(-44.1+53.9)/(-42.2+53.9)]; // 정보화동 inner east face is x -44.1 (rooms were drawn to -42.2)
 const lightWood=S({map:rep(woodTex('#c9a173'),1,1),roughness:0.55}),white=S({color:0xf4f4f1,roughness:0.6}),metal=S({color:0x8a8d90,roughness:0.4,metalness:0.6}),dark=S({color:0x2b2b2b});
 const led=S({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.85});
 const leds=(R,x0,x1,n0,n1,y=2.86,sx=2.4,sn=2.4)=>{const at=[];for(let x=x0+sx/2;x<x1;x+=sx)for(let n=n0+sn/2;n<n1;n+=sn)at.push([x,n]);R.inst([[0.6,0.02,0.6,0,y,0,led]],at);};
 // 1) 소회의실 = 본관 1F 회의실 (x -1.95..2.05, n 13.1..20.25)
 add('main_1F',(R)=>{const pink=S({color:0xe7a3b4,roughness:0.6});
  R.box(lightWood,-0.55,0.65,14.6,19.0,0.7,0.75);R.inst([[0.06,0.7,0.06,0,0.35,0,metal]],[[-0.45,14.8],[0.55,14.8],[-0.45,18.8],[0.55,18.8]]);
  const ch=[];for(let n=15.0;n<=18.7;n+=0.75){ch.push([-0.95,n,-Math.PI/2],[1.05,n,Math.PI/2]);}ch.push([0.05,19.45,Math.PI],[0.05,14.15,0]);R.inst(chairParts(pink,metal,pink),ch);
  R.box(white,1.45,2.05,15.0,19.9,0,0.88);R.box(S({color:0xd8d4cc,roughness:0.3}),1.41,2.07,15.0,19.9,0.88,0.92);R.box(white,1.7,2.05,15.0,19.9,1.6,2.3);
  R.box(S({color:0xb0b4b8,metalness:0.5,roughness:0.3}),1.55,1.95,19.2,19.7,0.92,1.25);
  const bw=S({map:rep(woodTex('#a77a4c'),1,1),roughness:0.6});R.box(bw,-1.95,-1.52,15.8,19.9,0,1.95);for(let y=0.4;y<1.9;y+=0.42)R.box(S({color:0x6e4e30}),-1.52,-1.5,15.8,19.9,y,y+0.02);
  const blind=S({color:0xe9e1cf,roughness:0.9});R.wallp(blind,'x',-1.6,1.9,13.13,1.0,2.5,1);
  const clk=new THREE.Mesh(new THREE.CircleGeometry(0.17,32),S({map:cv(128,128,(x)=>{x.fillStyle='#fff';x.beginPath();x.arc(64,64,62,0,7);x.fill();x.strokeStyle='#222';x.lineWidth=5;x.stroke();x.lineWidth=4;x.beginPath();x.moveTo(64,64);x.lineTo(64,24);x.moveTo(64,64);x.lineTo(92,70);x.stroke();})}));clk.position.set(-1.92,2.35,-17.8);clk.rotation.y=Math.PI/2;chunks.main_1F.group.add(clk);
  R.rects.push([-0.6,14.55,0.7,19.05],[1.45,15.0,2.05,19.9],[-1.95,15.8,-1.5,19.9]);});
 // 2) 도서관 = 정보화동 2F 도서실 (x -53.9..-42.2, n -41.4..-15.0)
 add('info_2F',(R)=>{const tile=S({map:rep(cv(256,256,(x,w,h)=>{x.fillStyle='#d9ccb2';x.fillRect(0,0,w,h);x.strokeStyle='#bfb197';x.lineWidth=3;x.strokeRect(0,0,w,h);for(let i=0;i<400;i++){x.fillStyle=`rgba(120,100,70,${Math.random()*0.08})`;x.fillRect(Math.random()*w,Math.random()*h,3,3);}}),20,44),roughness:0.5});
  R.plane(tile,-53.85,-42.25,-41.35,-15.0,0.012);const grey=S({color:0x4a4d52,roughness:0.85});
  R.wallp(grey,'z',-41.3,-15.2,-42.3,2.1,2.95,-1);R.wallp(grey,'x',-53.8,-42.3,-41.33,2.1,2.95,1);
  const sh=lightWood;const books=S({map:rep(cv(256,64,(x,w,h)=>{for(let i=0;i<w;i+=6){x.fillStyle=`hsl(${Math.random()*360},45%,${40+Math.random()*25}%)`;x.fillRect(i,6+Math.random()*10,5,h);}}),6,1)});
  for(const[a,b]of[[-40.9,-31],[-29.5,-17.5]]){R.box(sh,-42.75,-42.3,a,b,0,1.95);for(let y=0.08;y<1.9;y+=0.47){R.box(books,-42.74,-42.73,a+0.1,b-0.1,y,y+0.34).rotation.y=0;}R.rects.push([-42.8,a,-42.3,b]);}
  R.box(sh,-53.3,-43.3,-41.3,-40.85,0,1.95);R.wallp(books,'x',-53.2,-43.4,-40.84,0.1,1.9,1);R.rects.push([-53.3,-41.3,-43.3,-40.85]);
  const lime=S({color:0xa9cf3c,roughness:0.6});const tb=[];const ch=[];
  for(let n=-37.5;n<=-19;n+=4.2)for(const x of[-50.3,-46.3]){tb.push([x,n]);ch.push([x-0.45,n-0.75,0],[x+0.45,n-0.75,0],[x-0.45,n+0.75,Math.PI],[x+0.45,n+0.75,Math.PI]);R.rects.push([x-0.9,n-0.45,x+0.9,n+0.45]);}
  R.inst([[1.8,0.04,0.9,0,0.72,0,lightWood],[0.05,0.7,0.05,-0.82,0.35,-0.38,metal],[0.05,0.7,0.05,0.82,0.35,-0.38,metal],[0.05,0.7,0.05,-0.82,0.35,0.38,metal],[0.05,0.7,0.05,0.82,0.35,0.38,metal]],tb);R.inst(chairParts(lime,metal),ch);
  leds(R,-53.6,-42.4,-41,-15.2);},INFO_SX);
 // 3) 장미홀 = 정보화동 1F 시청각실 101 (x -53.9..-42.2, n -41.4..-21)
 add('info_1F',(R)=>{const panel=S({map:rep(woodTex('#b0804e',4),1,3),roughness:0.6});
  R.wallp(panel,'z',-41.3,-21.2,-42.3,0,2.9,-1);R.wallp(panel,'z',-41.3,-21.2,-53.85,0,2.9,1);R.wallp(panel,'x',-53.8,-42.3,-41.33,0,2.9,1);
  R.plane(S({color:0xe2e2de,roughness:0.35}),-53.85,-42.25,-37.4,-21.2,0.012);
  const stage=S({map:rep(woodTex('#9a6a3e'),3,3),roughness:0.5});R.box(stage,-53.85,-42.25,-41.3,-37.4,0,0.8);R.rects.push([-53.85,-41.3,-42.25,-37.4]);
  const maroon=S({color:0x6e1424,roughness:0.95});R.box(maroon,-53.8,-51.4,-41.2,-40.9,0.8,2.95);R.box(maroon,-44.6,-42.3,-41.2,-40.9,0.8,2.95);R.box(maroon,-53.8,-42.3,-37.6,-37.3,2.55,2.95);
  R.wallp(S({color:0xf6f6f6,roughness:0.4}),'x',-50.6,-45.4,-41.25,1.05,2.5,1);
  const bn=text('서울가동초등학교',4.6,0.42,{fg:'#ffffff',bg:'#1d4f9a',font:'bold 110px NanumGothic, sans-serif'});bn.position.set(-48.96,2.72,41.2);bn.rotation.y=Math.PI;chunks.info_1F.group.add(bn);
  const seatR=S({color:0xb3212f,roughness:0.7}),seatW=S({color:0xf3f1ec,roughness:0.5});const at=[];
  for(let r=0;r<12;r++){const n=-35.6+r*1.0,lift=r*0.12;for(let x=-53.2;x<=-44.2;x+=0.56){if(Math.abs(x+48)<0.55)continue;at.push([x,n,Math.PI]);}R.rects.push([-53.5,n-0.3,-48.6,n+0.35],[-47.4,n-0.3,-43.95,n+0.35]);}
  const seatG=S({color:0xc9cbc8,roughness:0.55});R.inst([[0.48,0.08,0.45,0,0.45,0,seatG],[0.48,0.62,0.07,0,0.76,-0.22,seatG],[0.05,0.62,0.48,-0.27,0.4,0,seatR]],at);
  leds(R,-53.6,-42.4,-37,-21.2);},INFO_SX);
 // 4) 뮤지컬실 = 본관 2F (x -57.3..-50.3, n -3.9..13.7)
 add('main_2F',(R)=>{const blk=S({color:0x141416,roughness:0.95});
  {let a0=-3.9;for(const[g0,g1]of[[-2.98,-1.93],[2.72,3.72],[6.02,7.07],[11.72,12.72]]){R.wallp(blk,'z',a0,g0,-50.35,0,2.88,-1);R.wallp(blk,'z',g0,g1,-50.35,2.15,2.88,-1);a0=g1;}R.wallp(blk,'z',a0,13.7,-50.35,0,2.88,-1);}R.wallp(blk,'x',-57.2,-50.4,13.68,0,2.88,-1);R.plane(blk,-57.3,-50.3,-3.9,13.7,2.87);
  const curt=S({color:0x0b0b0c,roughness:1});const cg=new THREE.Mesh(new THREE.BoxGeometry(0.12,2.85,17.4),curt);cg.position.set(-57.15,3.6+1.43,-4.9);chunks.main_2F.group.add(cg);
  const fl=S({map:rep(cv(1024,1024,(x,w,h)=>{const g=woodTex('#d0a876').image;x.drawImage(g,0,0,w,h);x.strokeStyle='#f1c40f';x.lineWidth=6;for(const f of[0.25,0.5,0.75]){x.beginPath();x.moveTo(f*w,0);x.lineTo(f*w,h);x.stroke();}x.beginPath();x.moveTo(0,h/2);x.lineTo(w,h/2);x.stroke();}),1,2),roughness:0.45});R.plane(fl,-57.3,-50.3,-3.9,13.7,0.012);
  const stp=S({map:rep(woodTex('#b98a55'),2,1),roughness:0.55});for(let i=0;i<3;i++)R.box(stp,-56.8,-50.8,11.0+i*0.85,13.65,0,0.4*(i+1));R.rects.push([-56.8,11.0,-50.8,13.65]);
  const mir=S({color:0xdfe6ea,roughness:0.03,metalness:1});R.wallp(mir,'x',-56.5,-51.0,-3.86,0.3,2.3,1);});
 // 5) 강당 = 다목적강당 2F 강당 202 (gym x 45.4..64.5, n -52.4..-19; stage x 50.4..60, n -57.2..-52.5)
 add('hall_2F',(R,e)=>{const court=S({map:cv(1024,2048,(x,w,h)=>{x.fillStyle='#e6cfa2';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=16)for(let j=0;j<h;j+=128){x.fillStyle=`rgba(${Math.random()<.5?'255,245,225':'150,110,60'},${0.06+Math.random()*0.08})`;x.fillRect(i,j+(i%32?64:0),16,128);}x.strokeStyle='rgba(120,90,50,0.18)';x.lineWidth=1;for(let i=0;i<w;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();}
   x.lineWidth=9;x.strokeStyle='#2f7fe0';x.strokeRect(70,100,w-140,h-200);x.beginPath();x.moveTo(70,h/2);x.lineTo(w-70,h/2);x.stroke();x.beginPath();x.arc(w/2,h/2,150,0,7);x.stroke();x.beginPath();x.arc(w/2,100,380,0,Math.PI);x.stroke();x.beginPath();x.arc(w/2,h-100,380,Math.PI,0);x.stroke();
   x.strokeStyle='#2e7d4f';x.strokeRect(160,300,w-320,h-600);x.beginPath();x.moveTo(w/2,0);x.lineTo(w/2,h);x.stroke();x.strokeStyle='#f2c230';x.lineWidth=6;x.strokeRect(30,40,w-60,h-80);}),roughness:0.3});
  // clboard 느티홀 47-64: dark green lower walls (~1.8 m) under white walls, blue gym mats stacked along the side wall, white goals
  {const gw=S({color:0x1f5a3c,roughness:0.6});R.wallp(gw,'z',-52.3,-19.2,45.47,0,1.8,1);R.wallp(gw,'z',-52.3,-19.2,64.43,0,1.8,-1);R.wallp(gw,'x',45.5,64.4,-19.17,0,1.8,-1);
   const bm=S({color:0x2a5fc0,roughness:0.8});for(let n=-46;n<-28;n+=2.2){R.box(bm,46.0,47.0,n,n+2.0,0,0.6);}R.rects.push([45.9,-46.1,47.05,-28.3]);
   const gol=S({color:0xf4f4f4,metalness:0.3,roughness:0.4});for(const n of[-20.0]){for(const x of[53.5,56.9])R.box(gol,x-0.04,x+0.04,n-0.04,n+0.04,0,2.0);R.box(gol,53.5,56.9,n-0.04,n+0.04,1.96,2.04);}}
  R.plane(court,45.4,64.5,-52.4,-19.1,0.012);
  const stg=S({map:rep(woodTex('#a06a3a'),3,2),roughness:0.5});R.box(stg,50.45,60.0,-52.35,-49.2,0,1.0);R.box(stg,49.3,50.45,-51.6,-49.2,0,0.5);R.rects.push([50.4,-52.4,60.0,-49.2]);
  const dwood=S({map:rep(woodTex('#4a2c17',6),3,1),roughness:0.55});R.box(dwood,50.45,60.0,-49.24,-49.18,0,1.0);R.box(dwood,49.3,50.45,-49.24,-49.18,0,0.5);R.box(S({color:0x2e1a0d,roughness:0.5}),50.4,60.05,-49.26,-49.14,0.96,1.04);
  const gb=text('서울가동초등학교',6.4,0.75,{fg:'#ffffff',bg:'#1f7a3a',font:'bold 120px NanumGothic, sans-serif'});gb.position.set(55.2,e+4.75,52.1);gb.rotation.y=Math.PI;chunks.hall_2F.group.add(gb);
  const maroon=S({color:0x7a1626,roughness:0.95});R.box(maroon,50.5,59.95,-52.35,-52.15,1.0,6.0);R.box(maroon,50.5,59.95,-52.3,-52.0,5.3,6.1);
  const pan=S({map:rep(woodTex('#b98552',5),2,3),roughness:0.6});R.box(pan,45.45,50.45,-52.35,-52.15,0,6.1);R.box(pan,60.0,64.45,-52.35,-52.15,0,6.1);R.box(S({color:0xe9e2d4}),45.45,64.45,-52.35,-52.15,6.1,6.9);
  const t=text('2007년 4월 25일',4.2,0.5,{fg:'#5a3b1e',font:'bold 100px NanumGothic, sans-serif'});t.position.set(55.6,e+6.5,52.13);t.rotation.y=Math.PI;chunks.hall_2F.group.add(t);
  const lg=new THREE.Mesh(new THREE.CircleGeometry(0.45,40),S({map:logoTex()}));lg.position.set(58.4,e+6.5,52.12);lg.rotation.y=Math.PI;chunks.hall_2F.group.add(lg);
  const steel=S({color:0x9aa3ab,roughness:0.45,metalness:0.6});const top=10.4-e;
  for(let n=-50.5;n<=-19.5;n+=4.4){R.box(steel,45.4,64.5,n-0.08,n+0.08,top-1.6,top-1.45);R.box(steel,45.4,64.5,n-0.08,n+0.08,top-0.15,top);for(let x=46;x<64.4;x+=1.6){R.box(steel,x-0.04,x+0.04,n-0.05,n+0.05,top-1.45,top-0.15);const d=new THREE.Mesh(new THREE.BoxGeometry(0.05,1.7,0.05),steel);d.position.set(x+0.8,e+top-0.8,-n);d.rotation.z=0.78;chunks.hall_2F.group.add(d);}}
  for(let x=47;x<64;x+=3)R.box(steel,x-0.05,x+0.05,-52.4,-19.1,top-0.25,top-0.1);});

 // 7) 과학실1/2 (본관 1F/2F x 52.2..59.65, n 5.05..18.2) per album photo: white lab benches, grey tops, teal chairs
 for(const ck of ['main_1F','main_2F'])add(ck,(R)=>{const wh=S({color:0xf1f1ee,roughness:0.5}),gp=S({color:0xb5b9bc,roughness:0.5}),top=S({color:0xd9dcdc,roughness:0.25}),teal=S({color:0x6fb4c2,roughness:0.5}),sink=S({color:0x3a3d40,roughness:0.3}),steel=S({color:0xc8ccd0,metalness:0.8,roughness:0.25});
  R.plane(S({color:0xc9cbc8,roughness:0.4,polygonOffset:true,polygonOffsetFactor:-2}),52.25,59.6,5.1,18.15,0.03);
  const at=[],ch=[];for(const n of[7.3,10.2,13.1])for(const x of[54.4,57.6]){at.push([x,n]);ch.push([x-0.45,n-0.85,0],[x+0.45,n-0.85,0],[x-0.45,n+0.85,Math.PI],[x+0.45,n+0.85,Math.PI]);R.rects.push([x-0.95,n-0.55,x+0.95,n+0.55]);}
  R.inst([[1.8,0.78,1.0,0,0.39,0,wh],[1.82,0.5,1.02,0,0.45,0,gp],[1.86,0.04,1.06,0,0.8,0,top],[0.35,0.02,0.3,0,0.83,0,sink],[0.03,0.3,0.03,0,0.97,0.1,steel],[0.03,0.03,0.18,0,1.11,0.02,steel]],at);
  R.inst(chairParts(teal,metal),ch);
  R.box(wh,54.3,57.7,15.6,16.4,0,0.85);R.box(top,54.25,57.75,15.55,16.45,0.85,0.89);R.rects.push([54.3,15.6,57.7,16.4]);
  R.box(dark,55.6,56.2,15.8,16.2,0.89,1.25);
  R.wallp(S({color:0xfafafa,roughness:0.2}),'x',53.2,58.6,18.12,0.9,2.2,-1);R.box(gp,53.1,58.7,18.0,18.12,0.85,0.9);
  const gl=S({color:0xa9c6cf,roughness:0.05,metalness:0.2,transparent:true,opacity:0.5});for(let n=6.2;n<14;n+=1.25){R.box(wh,52.25,52.75,n,n+1.2,0,0.85);R.box(gl,52.27,52.7,n+0.02,n+1.18,0.9,2.1);}R.rects.push([52.25,6.2,52.75,14]);
  leds(R,52.4,59.4,5.3,18,2.86,2.4,2.4);});
 // 8) 방송실 (본관 1F x -33.55..-29.25, n 13.1..20.2): console desk, monitors, chair, studio glass
 add('main_1F',(R)=>{const wh=S({color:0xf0f0ed,roughness:0.5}),blk=S({color:0x1b1c1e,roughness:0.4}),scr=S({color:0x223344,emissive:0x2a4a6a,emissiveIntensity:0.5,roughness:0.2}),frame=S({map:rep(woodTex('#c08a55'),1,1),roughness:0.6});
  R.box(wh,-33.5,-32.75,13.8,17.6,0,0.74);R.box(S({color:0xe8e8e4,roughness:0.3}),-33.52,-32.7,13.78,17.62,0.74,0.77);R.rects.push([-33.5,13.8,-32.75,17.6]);
  for(const n of[14.6,15.5,16.6]){R.box(blk,-33.35,-33.3,n-0.4,n+0.4,0.95,1.45);R.box(scr,-33.3,-33.29,n-0.37,n+0.37,0.98,1.42);R.box(blk,-33.4,-33.25,n-0.08,n+0.08,0.77,0.95);}
  R.box(blk,-33.2,-32.9,15.2,15.9,0.77,0.8);
  R.inst([[0.5,0.08,0.5,0,0.48,0,blk],[0.5,0.55,0.06,0,0.85,-0.24,blk],[0.06,0.44,0.06,0,0.24,0,metal],[0.6,0.04,0.6,0,0.04,0,metal]],[[-32.2,15.5,Math.PI/2]]);
  R.box(frame,-33.5,-29.3,18.55,18.7,0,0.9);R.box(frame,-33.5,-29.3,18.55,18.7,2.2,2.9);for(const x of[-33.5,-31.45,-29.4])R.box(frame,x,x+0.1,18.55,18.7,0.9,2.2);
  R.box(S({color:0xbcd6e0,roughness:0.05,transparent:true,opacity:0.35}),-33.4,-29.3,18.6,18.64,0.9,2.2);R.rects.push([-33.55,18.5,-29.25,18.75]);
  leds(R,-33.4,-29.4,13.3,18.4,2.86,2.0,2.4);});
 // 9) 주리홀(학생식당) (다목적강당 1F x 45.3..65.15, n -60.25..-34.05): rows of tables + stools
 add('hall_1F',(R)=>{// clboard 급식실 104-123: long rows of white-marble tables with orange round swing-arm stools, light grey floor, mint lower walls + cream upper, cream columns
  const mar=S({map:rep(cv(256,256,(x,w,h)=>{x.fillStyle='#e9e9e6';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){x.fillStyle=`rgba(110,110,110,${Math.random()*0.12})`;x.fillRect(Math.random()*w,Math.random()*h,2,2);}}),4,1),roughness:0.25}),org=S({color:0xf07a1e,roughness:0.45}),gr=S({color:0x55595d,metalness:0.5,roughness:0.4});const at=[],st=[];
  R.plane(S({color:0xdfe1df,roughness:0.3,polygonOffset:true,polygonOffsetFactor:-2}),45.4,65.1,-60.2,-34.1,0.02);
  {const mn=S({color:0xbfe5c8,roughness:0.6});R.wallp(mn,'z',-60.1,-34.2,45.37,0,1.3,1);R.wallp(mn,'z',-60.1,-34.2,65.1,0,1.3,-1);}
  for(let x=47.4;x<64;x+=2.05){for(let n=-58.2;n<-37;n+=4.6){at.push([x,n]);for(const dn of[-1.6,-0.53,0.53,1.6])for(const dx of[-0.52,0.52])st.push([x+dx,n+dn]);}R.rects.push([x-0.35,-59.3,x+0.35,-36]);}
  R.inst([[0.78,0.04,4.3,0,0.72,0,mar],[0.06,0.68,0.06,0,0.36,-1.9,gr],[0.06,0.68,0.06,0,0.36,1.9,gr],[0.06,0.06,4.0,0,0.3,0,gr]],at);
  R.inst([[0.32,0.05,0.32,0,0.44,0,org],[0.04,0.4,0.04,0,0.24,0,gr]],st);});

 // 6) 운동장 dressing: striped shade canopies, flagpoles, 가동문화관 sign
 const site=chunks.site;if(site){const g=new THREE.Group();g.name='playground';const stripes=cv(512,64,(x,w,h)=>{const cs=['#e53935','#fdd835','#43a047','#1e88e5','#fb8c00','#ffffff','#8e24aa'];for(let i=0;i<16;i++){x.fillStyle=cs[i%cs.length];x.fillRect(i*w/16,0,w/16,h);}});const sm=S({map:stripes,side:THREE.DoubleSide,roughness:0.8});const post=S({color:0x6b6f74,metalness:0.5,roughness:0.4});
  for(const[x0,x1]of[[-24,-6.2],[7.2,26]]){const len=x1-x0;const roof=new THREE.Mesh(new THREE.PlaneGeometry(len,4.4),sm);roof.material.map.wrapS=THREE.RepeatWrapping;roof.material.map.repeat.set(len/8,1);roof.rotation.x=-Math.PI/2+0.06;roof.position.set((x0+x1)/2,3.0,16.4);roof.castShadow=true;g.add(roof);
   for(let x=x0;x<=x1+0.01;x+=len/Math.round(len/5)){for(const[z,h]of[[14.4,3.15],[18.4,2.9]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,h,8),post);p.position.set(x,h/2,z);g.add(p);const cl=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,1.3,8),S({color:0xc77a3a,roughness:0.6}));cl.position.set(x,0.65,z);g.add(cl);}}}
  // 구령대 per photo 13133afe + aerials: low square tiled platform at the field edge, black railing on three sides, four orange-wood columns on chrome bases,
  // flat curved arched roof (grey truss underneath, rainbow red->violet bands on top) with a small arched crest; asphalt road in front
  {const bx0=-4.6,bx1=5.7,z0=12.5,z1=18.6,H=0.45,cx=(bx0+bx1)/2,cz=(z0+z1)/2;
   const tile=S({map:rep(cv(128,128,(x,w,h)=>{x.fillStyle='#c8cdd1';x.fillRect(0,0,w,h);x.strokeStyle='#aeb3b7';x.lineWidth=2;x.strokeRect(0,0,w,h);}),10,6),roughness:0.4});
   const base=new THREE.Mesh(new THREE.BoxGeometry(bx1-bx0,H,z1-z0),tile);base.position.set(cx,H/2,cz);base.receiveShadow=true;g.add(base);
   const edge=new THREE.Mesh(new THREE.BoxGeometry(bx1-bx0+0.06,0.06,0.08),S({color:0xd9b32a}));edge.position.set(cx,0.03,z0-0.02);g.add(edge);
   const rb=S({color:0x1c1d20,metalness:0.5,roughness:0.4});const rail=(x0,x1,z,alongZ)=>{const L=alongZ?Math.abs(x1-x0):x1-x0;for(const y of[H+1.0,H+0.12]){const r=new THREE.Mesh(new THREE.BoxGeometry(alongZ?0.05:L,0.05,alongZ?L:0.05),rb);r.position.set(alongZ?z:(x0+x1)/2,y,alongZ?(x0+x1)/2:z);g.add(r);}for(let t=0;t<=L+0.01;t+=1.6){const v=new THREE.Mesh(new THREE.BoxGeometry(0.05,1.0,0.05),rb);v.position.set(alongZ?z:x0+t,H+0.5,alongZ?x0+t:z);g.add(v);}for(let t=0.1;t<=L;t+=0.13){const v=new THREE.Mesh(new THREE.BoxGeometry(0.018,0.88,0.018),rb);v.position.set(alongZ?z:x0+t,H+0.56,alongZ?x0+t:z);g.add(v);}};
   rail(bx0,bx1,z1-0.05,false);rail(z0+1.0,z1,bx0+0.05,true);rail(z0+1.0,z1,bx1-0.05,true);
   const wood=S({color:0xc0682c,roughness:0.55}),chrome=S({color:0xe4e8ec,metalness:0.95,roughness:0.12});const YC=4.6;
   for(const [x,z] of[[bx0+0.3,z0+0.4],[bx1-0.3,z0+0.4],[bx0+0.3,z1-0.6],[bx1-0.3,z1-0.6]]){const c=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.19,YC-H,14),wood);c.position.set(x,H+(YC-H)/2,z);g.add(c);const cb=new THREE.Mesh(new THREE.CylinderGeometry(0.23,0.27,0.4,14),chrome);cb.position.set(x,H+0.2,z);g.add(cb);const ct=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.2,0.25,14),chrome);ct.position.set(x,YC-0.05,z);g.add(ct);}
   const span=(bx1-bx0)/2+1.4,R=span*1.6,ang=Math.asin(span/R),D=(z1-z0)+1.4;
   const rain=cv(512,64,(x,w,h)=>{const cs=['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#3949ab','#8e24aa'];for(let i=0;i<7;i++){x.fillStyle=cs[i];x.fillRect(i*w/7,0,w/7+1,h);}});
   {const mk=(r,mat)=>{const geo=new THREE.CylinderGeometry(r,r,D,40,1,true,Math.PI-ang,2*ang);geo.rotateX(Math.PI/2);const m=new THREE.Mesh(geo,mat);m.position.set(cx,YC+0.6-R,cz);g.add(m);return m;};
    mk(R,S({map:rain,roughness:0.5,side:THREE.FrontSide}));mk(R-0.05,S({color:0x6f757b,metalness:0.5,roughness:0.4,side:THREE.BackSide}));
    for(let k=-3;k<=3;k++){const tx=cx+k*span/3.5;const tr=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.25,D-0.2),S({color:0x8a9096,metalness:0.6}));tr.position.set(tx,YC+0.6-R+Math.sqrt(R*R-(tx-cx)**2)-0.18,cz);g.add(tr);}
    const crest=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.05,6,24,Math.PI),S({color:0xd9dcdf,metalness:0.7}));crest.position.set(cx,YC+0.6,cz-0.2);g.add(crest);
    const cr2=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,1.4,20,1,true,-Math.PI/2,Math.PI),S({map:rain,transparent:true,opacity:0.85,side:THREE.DoubleSide}));cr2.rotation.x=Math.PI/2;cr2.position.set(cx,YC+0.6,cz-0.2);cr2.scale.set(1,1,0.6);g.add(cr2);}
   WALLS.site=WALLS.site||{e:0,s:[],r:[]};WALLS.site.r.push([bx0,-z1,bx1,-(z0+0.9)]);
   // asphalt road between the courtyard planters and the field edge
   {const rd=new THREE.Mesh(new THREE.PlaneGeometry(92,6.0),S({color:0x55585c,roughness:0.95}));rd.rotation.x=-Math.PI/2;rd.position.set(1,0.012,8.6);g.add(rd);}}
  const fp=[[7.6,11.6],[9.6,11.6],[11.6,11.6]];const fl=S({map:cv(300,200,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#cd2e3a';x.beginPath();x.arc(w/2,h/2,50,Math.PI,0);x.fill();x.fillStyle='#0047a0';x.beginPath();x.arc(w/2,h/2,50,0,Math.PI);x.fill();x.fillStyle='#000';[[50,40],[w-70,40],[50,h-60],[w-70,h-60]].forEach(([a,b])=>x.fillRect(a,b,20,20));}),side:THREE.DoubleSide});const fl2=S({color:0x2e7d32,side:THREE.DoubleSide});
  fp.forEach(([x,z],i)=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.08,12,8),S({color:0xdedede,metalness:0.6,roughness:0.3}));p.position.set(x,6,z);g.add(p);const f=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.2),i===1?fl:fl2);f.position.set(x+0.95,11.2,z);g.add(f);});
  // exterior murals per school photos (refs/album3): 다목적강당 = yellow graphic wall 'SEOUL GADONG ELEMENTARY SCHOOL' (mural_gym_2, newest repaint),
  // 정보화동 = low tile-mosaic band of children's drawing tiles behind a black fence (mural_info_1/2)
  {const gymTex=cv(2048,768,(x,w,h)=>{x.fillStyle='#f6cf3c';x.fillRect(0,0,w,h);
     x.fillStyle='#f9dd6a';x.fillRect(0,h*0.84,w,h*0.16);
     const P=[['#8e6bd1',0.62,0.22,0.06],['#ef7fae',0.7,0.55,0.07],['#4fa3e0',0.86,0.3,0.05],['#ffffff',0.9,0.62,0.04],['#8e6bd1',0.44,0.7,0.05]];
     for(const[c,cx,cy,r]of P){x.fillStyle=c;x.beginPath();x.moveTo(w*cx,h*(cy-r*2.6));x.lineTo(w*(cx+r),h*cy);x.lineTo(w*cx,h*(cy+r*2.6));x.lineTo(w*(cx-r),h*cy);x.fill();}
     x.fillStyle='#ffffff';for(let k=0;k<6;k++){const X=w*0.3+k*58,Y=h*0.42;x.beginPath();x.moveTo(X,Y-40);x.lineTo(X+30,Y);x.lineTo(X,Y+40);x.lineTo(X+16,Y+40);x.lineTo(X+46,Y);x.lineTo(X+16,Y-40);x.fill();}
     x.fillStyle='#2f6fc4';x.beginPath();x.arc(w*0.12,h*0.36,h*0.2,Math.PI,0);x.fill();x.fillStyle='#f6cf3c';x.beginPath();x.arc(w*0.12,h*0.36,h*0.2,0,Math.PI);x.fill();x.strokeStyle='#ffffff';x.lineWidth=14;x.beginPath();x.arc(w*0.12,h*0.36,h*0.21,0,7);x.stroke();
     x.fillStyle='#1f3d6b';x.textAlign='center';x.font='bold 120px NanumGothic, sans-serif';x.fillText('서울가동초등학교',w*0.56,h*0.86);x.font='bold 64px sans-serif';x.fillText('SEOUL GADONG ELEMENTARY SCHOOL',w*0.56,h*0.96);
     x.fillStyle='#3c3f44';x.fillRect(w*0.86,h*0.42,w*0.1,h*0.42);x.fillStyle='#6f8fa8';x.fillRect(w*0.868,h*0.45,w*0.084,h*0.24);});
   const mos=cv(2048,256,(x,w,h)=>{const base=['#d9d4c8','#c9cfd2','#e2ddd0','#b9c4c9','#d2c7b4','#c4ccc0'],acc=['#e0743a','#c9473a','#3f8fa0','#6aa57a','#4b6fa8','#e3b844','#8a5ab0','#4a9e8e','#d98b8b'];const T=32;
     x.fillStyle='#9a9a94';x.fillRect(0,0,w,h);for(let i=0;i<w/T;i++)for(let j=0;j<h/T;j++){const r=Math.sin(i*12.9898+j*78.233)*43758.5453;const f=r-Math.floor(r);const patch=Math.sin(Math.floor(i/5)*3.1+Math.floor(j/3)*1.7)>0.8;
      x.fillStyle=patch?acc[Math.floor(f*acc.length)]:base[Math.floor(f*base.length)];x.fillRect(i*T+2,j*T+2,T-4,T-4);
      if(f>0.45){x.strokeStyle=acc[Math.floor(f*97)%acc.length];x.lineWidth=2;x.beginPath();x.arc(i*T+T/2,j*T+T/2,4+f*8,0,5);x.stroke();}}});
   const put=(tex,W,H,x,y,z,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(W,H),S({map:tex,roughness:0.85}));m.position.set(x,y,z);m.rotation.y=ry;m.receiveShadow=true;g.add(m);return m;};
   put(gymTex,8.6,3.2,44.96,1.7,52.8,-Math.PI/2);   // 다목적강당 west 1F wall (playground side), n -57.1..-48.5, full storey height as in the photo
   const mt=mos;mt.wrapS=THREE.RepeatWrapping;mt.repeat.set(1,1);
   const fb=S({color:0x222426,metalness:0.4,roughness:0.5});
   for(const[n0,n1]of[[-36.1,-30.6],[-28.2,-20.5]]){const L=n1-n0,c=(n0+n1)/2;const t=mos.clone();t.needsUpdate=true;t.wrapS=THREE.RepeatWrapping;t.repeat.set(L/10.6,1);put(t,L,1.15,-43.76,0.7,-c,Math.PI/2);   // 정보화동 east base mosaic band (door at n≈-29 left clear)
    for(let n=n0;n<=n1+0.01;n+=L/Math.ceil(L/2.6)){const p=new THREE.Mesh(new THREE.BoxGeometry(0.05,1.25,0.05),fb);p.position.set(-43.0,0.62,-n);g.add(p);}
    for(const y of[0.15,1.2]){const r=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,L),fb);r.position.set(-43.0,y,-c);g.add(r);}
    WALLS.site=WALLS.site||{e:0,s:[],r:[]};WALLS.site.r.push([-43.05,n0,-42.95,n1]);}
  }
   // playground along the far boundary fence (aerials + photo 611d228b): white steel climbing frame, platform with two grey metal slides,
   // sloped steel bar frames, multicolour kerb, street lamps. Strip south of the track, x -18..30, n -96..-90.6
   {const X0=-18,X1=30,N0=-96,N1=-90.6;WALLS.site=WALLS.site||{e:0,s:[],r:[]};const col=(x0,n0,x1,n1)=>WALLS.site.r.push([x0,n0,x1,n1]);
    const B=(m,x0,x1,y0,y1,n0,n1)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,n1-n0),m);b.position.set((x0+x1)/2,(y0+y1)/2,-(n0+n1)/2);b.castShadow=true;g.add(b);return b;};
    const tube=(m,a,b_,r=0.035)=>{const d=new THREE.Mesh(new THREE.CylinderGeometry(r,r,a.distanceTo(b_),6),m);d.position.copy(a).add(b_).multiplyScalar(0.5);d.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b_.clone().sub(a).normalize());g.add(d);};
    const V3=(x,y,n)=>new THREE.Vector3(x,y,-n);const wht=S({color:0xf1f2f0,metalness:0.4,roughness:0.4}),grey=S({color:0xa9aeb3,metalness:0.7,roughness:0.3}),sand=S({color:0xd9c49a,roughness:1});
    {const s_=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,N1-N0),sand);s_.rotation.x=-Math.PI/2;s_.position.set((X0+X1)/2,0.01,-(N0+N1)/2);g.add(s_);}
    const kc=[0xe53935,0x1e88e5,0xfdd835,0x43a047];let ki=0;for(let x=X0;x<X1-0.01;x+=0.8)B(S({color:kc[ki++%4],roughness:0.6}),x,x+0.78,0,0.2,N1-0.18,N1);
    // white steel climbing frame (grid 4 x 1.6 x 2.0)
    {const x0=-14,n0=-94.8;for(let i=0;i<=5;i++)for(let j=0;j<=2;j++)tube(wht,V3(x0+i*0.8,0,n0+j*0.8),V3(x0+i*0.8,2.0,n0+j*0.8),0.03);
     for(const y of[0.5,1.0,1.5,2.0]){for(let j=0;j<=2;j++)tube(wht,V3(x0,y,n0+j*0.8),V3(x0+4,y,n0+j*0.8),0.022);for(let i=0;i<=5;i++)tube(wht,V3(x0+i*0.8,y,n0),V3(x0+i*0.8,y,n0+1.6),0.022);}col(x0,n0,x0+4,n0+1.6);}
    // platform tower with two grey metal slides
    {const x0=0,n0=-95.2;for(const[a,b_]of[[0,0],[1.6,0],[0,1.6],[1.6,1.6]])tube(wht,V3(x0+a,0,n0+b_),V3(x0+a,2.6,n0+b_),0.06);B(wht,x0,x0+1.6,1.6,1.68,n0,n0+1.6);
     for(const b_ of[0,1.6])tube(wht,V3(x0,2.5,n0+b_),V3(x0+1.6,2.5,n0+b_));
     for(const [s,dn] of[[1,0.3],[-1,1.3]]){const ch=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.05,0.6),grey);const xs=s>0?x0+1.6+1.6:x0-1.6;ch.position.set(xs,0.85,-(n0+dn));ch.rotation.z=-s*0.46;g.add(ch);for(const e of[-0.3,0.3]){const sd=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.18,0.03),grey);sd.position.set(xs,0.93,-(n0+dn+e));sd.rotation.z=-s*0.46;g.add(sd);}}
     col(x0-3.4,n0,x0+5,n0+1.6);}
    // sloped steel bar frames
    for(const xa of[12,16,20]){for(const dn of[-94.8,-93.2])tube(wht,V3(xa,0,dn),V3(xa+2.6,1.8,dn),0.04);for(let k=0;k<=6;k++){const t=k/6;tube(wht,V3(xa+2.6*t,1.8*t,-94.8),V3(xa+2.6*t,1.8*t,-93.2),0.02);}tube(wht,V3(xa+2.6,0,-94.8),V3(xa+2.6,1.8,-94.8),0.04);tube(wht,V3(xa+2.6,0,-93.2),V3(xa+2.6,1.8,-93.2),0.04);col(xa,-94.9,xa+2.7,-93.1);}
    // street lamps along the fence
    for(const x of[-16,6,26]){tube(S({color:0x4a4f55,metalness:0.6}),V3(x,0,-95.6),V3(x,4.5,-95.6),0.06);const l=new THREE.Mesh(new THREE.SphereGeometry(0.2,10,8),S({color:0xfff6d8,emissive:0x665c3a}));l.position.set(x,4.6,95.6);g.add(l);}
   }
  const tx=text('가동문화관',7.5,1.1,{fg:'#ffffff',font:'bold 130px NanumGothic, sans-serif'});tx.rotation.y=-Math.PI/2;tx.position.set(44.85,8.6,30.5);g.add(tx);
  const lg=new THREE.Mesh(new THREE.CircleGeometry(0.8,40),S({map:logoTex()}));lg.rotation.y=-Math.PI/2;lg.position.set(44.85,8.6,25.9);g.add(lg);
  site.group.add(g);}

 // 11) special-room furniture (P1-5): 컴퓨터실1/2, 음악실, 보건실, 인쇄실, 상담실, 실과실, 조정실. Extents from wall ray-casts; 1 m kept clear along walls for doors.
 {const blk=S({color:0x23262b,roughness:0.5}),scr=S({color:0x2a3b52,emissive:0x1b2a40,emissiveIntensity:0.5,roughness:0.3}),grayT=S({color:0xd7dadd,roughness:0.5}),
  wd=S({color:0xc9a173,roughness:0.6}),bseat=S({color:0x3e6fb0,roughness:0.6}),gseat=S({color:0x6aa84f,roughness:0.6}),sheet=S({color:0xf2f6fa,roughness:0.9}),curtain=S({color:0xbfe3e0,roughness:0.9,side:THREE.DoubleSide}),
  copier=S({color:0xe8e8e4,roughness:0.5}),paper=S({color:0xffffff,roughness:0.9}),sofa=S({color:0x8a6a4f,roughness:0.85}),stool=S({color:0xd9822b,roughness:0.6}),steel=S({color:0xb8bcc0,metalness:0.6,roughness:0.35});
  const pcRoom=(ck,x0,n0,x1,n1)=>add(ck,(R)=>{const at=[],mon=[],ch=[];for(let n=n0+2.4;n<n1-1.0;n+=1.7){R.rects.push([x0+1.1,n-0.3,x1-1.1,n+0.3]);for(let x=x0+1.5;x<x1-1.3;x+=0.9){at.push([x,n]);mon.push([x,n]);ch.push([x,n-0.65,0]);}}
   R.inst([[0.85,0.03,0.6,0,0.72,0,grayT],[0.85,0.7,0.03,0,0.36,0.28,grayT]],at);R.inst([[0.5,0.32,0.03,0,1.0,0.12,scr],[0.52,0.34,0.02,0,1.0,0.14,blk],[0.08,0.24,0.08,0,0.8,0.16,blk],[0.42,0.02,0.15,0,0.745,-0.1,blk]],mon);R.inst(chairParts(bseat,metal),ch);
   const cx=(x0+x1)/2;R.box(grayT,cx-1.0,cx+1.0,n0+0.7,n0+1.3,0.72,0.76);R.box(blk,cx-0.3,cx+0.3,n0+0.9,n0+0.95,0.8,1.15);R.rects.push([cx-1.0,n0+0.7,cx+1.0,n0+1.3]);R.wallp(S({color:0xf7f7f7,roughness:0.4}),'x',cx-2.2,cx+2.2,n0+0.06,0.95,2.15,1);});
  pcRoom('info_3F',-54.5,-41.9,-43.8,-28.2);pcRoom('info_3F',-54.5,-28.05,-43.8,-14.9);
  // 음악실: upright piano, drum, xylophone tables, chairs in arcs, staff-lined board
  add('main_3F',(R)=>{const x0=52.2,n0=-4.35,x1=59.65,n1=4.75;R.box(blk,x0+1.0,x0+2.5,n0+0.4,n0+1.0,0,1.25);R.box(S({color:0xf5f5f0}),x0+1.05,x0+2.45,n0+1.0,n0+1.2,0.72,0.76);R.rects.push([x0+1.0,n0+0.4,x0+2.5,n0+1.2]);
   const st=cv(512,160,(x,w,h)=>{x.fillStyle='#f8f8f6';x.fillRect(0,0,w,h);x.strokeStyle='#333';x.lineWidth=2;for(let k=0;k<5;k++){const y=40+k*16;x.beginPath();x.moveTo(10,y);x.lineTo(w-10,y);x.stroke();}x.fillStyle='#222';x.font='bold 90px serif';x.fillText('𝄞',14,118);});
   R.wallp(S({map:st,roughness:0.4}),'x',x0+3.2,x1-1.0,n0+0.06,1.0,2.1,1);
   R.box(S({color:0xc0392b,roughness:0.4}),x1-1.6,x1-0.9,n0+0.5,n0+1.2,0,0.55);R.rects.push([x1-1.6,n0+0.5,x1-0.9,n0+1.2]);
   const ch=[];for(let row=0;row<4;row++){const n=n0+2.8+row*1.3;for(let x=x0+1.3;x<x1-1.0;x+=0.75)ch.push([x,n,Math.PI]);}R.inst(chairParts(gseat,metal),ch);
   for(const x of[x0+0.6,x1-0.6])R.box(blk,x-0.3,x+0.3,n1-0.5,n1-0.2,0,1.0);
   const xy=S({map:cv(256,64,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i%2?'#d9a066':'#c08040';x.fillRect(i*16,8,14,h-16);}})});R.box(xy,x0+3.5,x0+5.0,n0+1.4,n0+1.8,0.7,0.76);R.box(metal,x0+3.6,x0+4.9,n0+1.55,n0+1.65,0,0.7);R.rects.push([x0+3.5,n0+1.4,x0+5.0,n0+1.8]);});
  // 상담실: sofa set + low table + bookshelf, plant
  add('main_3F',(R)=>{const x0=52.4,n0=14.05,x1=59.65,n1=20.25,cx=(x0+x1)/2,cn=(n0+n1)/2;R.box(sofa,cx-1.2,cx+1.2,cn-1.3,cn-0.6,0,0.45);R.box(sofa,cx-1.2,cx+1.2,cn-1.35,cn-1.15,0.45,0.85);
   R.box(sofa,cx-1.2,cx+1.2,cn+0.6,cn+1.3,0,0.45);R.box(sofa,cx-1.2,cx+1.2,cn+1.15,cn+1.35,0.45,0.85);R.box(wd,cx-0.7,cx+0.7,cn-0.35,cn+0.35,0.38,0.42);R.rects.push([cx-1.2,cn-1.35,cx+1.2,cn+1.35]);
   R.box(wd,x1-1.4,x1-0.2,n1-0.45,n1-0.15,0,1.8);R.rects.push([x1-1.4,n1-0.45,x1-0.2,n1-0.15]);R.box(S({color:0x3f7d3a}),x0+0.4,x0+0.9,n1-0.9,n1-0.4,0.3,1.2);R.box(S({color:0x8d6e63}),x0+0.45,x0+0.85,n1-0.85,n1-0.45,0,0.35);});
  // 보건실: 3 beds with curtains, desk, medicine cabinet, scale
  add('main_1F',(R)=>{const x0=11.5,n0=13.1,x1=20.2,n1=20.35;const beds=[];for(let k=0;k<3;k++){const x=x0+1.4+k*2.2;R.box(steel,x-0.48,x+0.48,n1-2.25,n1-0.25,0,0.5);R.box(sheet,x-0.46,x+0.46,n1-2.2,n1-0.3,0.5,0.62);R.box(paper,x-0.35,x+0.35,n1-0.75,n1-0.35,0.62,0.72);R.rects.push([x-0.5,n1-2.25,x+0.5,n1-0.25]);
    R.wallp(curtain,'z',n1-2.4,n1-0.1,x+0.75,0.3,2.2,1);R.box(steel,x+0.73,x+0.77,n1-2.4,n1-0.1,2.2,2.23);}
   R.box(wd,x1-2.0,x1-0.4,n0+1.0,n0+1.7,0.72,0.76);R.box(wd,x1-2.0,x1-1.95,n0+1.0,n0+1.7,0,0.72);R.box(wd,x1-0.45,x1-0.4,n0+1.0,n0+1.7,0,0.72);R.rects.push([x1-2.0,n0+1.0,x1-0.4,n0+1.7]);
   R.box(S({color:0xf0f0f0,roughness:0.3}),x0+0.3,x0+1.5,n0+0.3,n0+0.75,0,1.9);R.box(S({color:0x9fc8e8,roughness:0.1,transparent:true,opacity:0.5}),x0+0.3,x0+1.5,n0+0.74,n0+0.76,0.9,1.85);R.rects.push([x0+0.3,n0+0.3,x0+1.5,n0+0.75]);
   R.box(steel,x0+2.2,x0+2.6,n0+0.4,n0+0.8,0,0.08);R.box(steel,x0+2.38,x0+2.42,n0+0.75,n0+0.8,0.08,1.1);
   const cr=S({map:cv(128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#d32f2f';x.fillRect(48,20,32,88);x.fillRect(20,48,88,32);})});R.wallp(cr,'x',x0+3.0,x0+3.6,n0+0.06,1.6,2.2,1);});
  // 인쇄실: 2 copiers, paper shelf, work table
  add('main_1F',(R)=>{const x0=-13.35,n0=23.3,x1=-9.05,n1=28.65; // room starts north of the 1F corridor (n<23.1 is corridor)for(const n of[n0+1.3,n0+2.8]){R.box(copier,x0+0.3,x0+1.0,n-0.55,n+0.55,0,1.05);R.box(S({color:0x55606a}),x0+0.35,x0+0.95,n-0.5,n+0.5,1.05,1.12);R.box(S({color:0x6fa8dc,emissive:0x203040}),x0+0.9,x0+1.0,n-0.15,n+0.15,1.0,1.06);R.rects.push([x0+0.3,n-0.55,x0+1.0,n+0.55]);}
   R.box(steel,x1-0.65,x1-0.2,n1-3.0,n1-0.5,0,1.9);for(let y=0.1;y<1.8;y+=0.45)R.box(paper,x1-0.62,x1-0.23,n1-2.9,n1-0.6,y,y+0.25);R.rects.push([x1-0.65,n1-3.0,x1-0.2,n1-0.5]);
   R.box(wd,x0+1.8,x0+3.0,n1-3.0,n1-1.4,0.85,0.9);R.box(metal,x0+1.85,x0+2.95,n1-2.95,n1-1.45,0,0.85);R.rects.push([x0+1.8,n1-3.0,x0+3.0,n1-1.4]);});
  // 실과실: 4 work tables with stools, sink counter
  add('main_1F',(R)=>{const x0=52.15,n0=-4.35,x1=59.65,n1=4.75;const st_=[];for(const x of[x0+2.4,x1-2.4])for(const n of[n0+2.6,n1-2.8]){R.box(wd,x-0.7,x+0.7,n-1.0,n+1.0,0.78,0.84);R.box(S({color:0x9e7b55}),x-0.65,x+0.65,n-0.95,n+0.95,0,0.78);R.rects.push([x-0.7,n-1.0,x+0.7,n+1.0]);for(const dn of[-0.6,0,0.6])st_.push([x-1.0,n+dn],[x+1.0,n+dn]);}
   R.inst([[0.32,0.04,0.32,0,0.6,0,stool],[0.04,0.58,0.04,0,0.29,0,metal]],st_);
   R.box(steel,x1-0.7,x1-0.1,n0+0.4,n0+3.4,0,0.88);R.box(S({color:0x9aa0a6,metalness:0.7,roughness:0.2}),x1-0.6,x1-0.2,n0+0.8,n0+1.4,0.86,0.89);R.box(S({color:0x9aa0a6,metalness:0.7,roughness:0.2}),x1-0.6,x1-0.2,n0+2.2,n0+2.8,0.86,0.89);R.rects.push([x1-0.7,n0+0.4,x1-0.1,n0+3.4]);});
  // 조정실 (장미홀 control booth): console desk + monitors + rack
  add('info_1F',(R)=>{const cx=-46.39,n=-20.3;R.box(blk,cx-1.2,cx+1.2,n-0.3,n+0.3,0,0.78);R.box(S({color:0x30343a}),cx-1.2,cx+1.2,n-0.3,n+0.3,0.78,0.82);R.rects.push([cx-1.2,n-0.3,cx+1.2,n+0.3]);
   R.inst([[0.5,0.32,0.03,0,1.05,0,scr],[0.52,0.34,0.02,0,1.05,-0.015,blk]],[[cx-0.6,n-0.15],[cx+0.6,n-0.15]]);{const fd=S({color:0xcfd8dc,roughness:0.5}),fr=S({color:0xd84315,roughness:0.5});let k=0;for(let x=cx-0.9;x<cx+1.0;x+=0.08,k++)R.box(k%6?fd:fr,x,x+0.03,n+0.05,n+0.15,0.82,0.85);}
   R.box(blk,cx+1.4,cx+1.95,n-0.3,n+0.3,0,1.6);R.rects.push([cx+1.4,n-0.3,cx+1.95,n+0.3]);});
 }
}
