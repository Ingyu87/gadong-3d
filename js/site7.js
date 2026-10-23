import * as THREE from 'three';
// Hall exterior rework (audit 30, items 1-11): full yellow 급식실 mural wall with rounded south end + porthole,
// recessed entrance, arch-top 2F windows, lime stair corridor with curved green roof, 강당 entrance walkway,
// lower/narrower hall roof, brick stair tower, 누리관 vertical slit windows.
const S=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:0.7},o));
function cvT(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
const NN=-38.6,NS=-54.8,TOP=5.0,X=44.6,EN0=-46.4,EN1=-43.0;
function muralTex(L,H){const ppm=180;return cvT(Math.round(L*ppm),Math.round(H*ppm),(x,w,h)=>{const m=v=>v*ppm,Y=y=>h-m(y);
 x.fillStyle='#f4c51e';x.fillRect(0,0,w,h);x.strokeStyle='#e3b414';x.lineWidth=3;for(let i=0;i<w;i+=m(0.9)){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();}
 const C=(u,v,r,c)=>{x.fillStyle=c;x.beginPath();x.arc(m(u),Y(v),m(r),0,7);x.fill();};
 const ring=(u,v,r,t,c)=>{x.strokeStyle=c;x.lineWidth=m(t);x.beginPath();x.arc(m(u),Y(v),m(r),0,7);x.stroke();};
 const plus=(u,v,s,c)=>{x.fillStyle=c;x.fillRect(m(u-s/2),Y(v+s/6),m(s),m(s/3));x.fillRect(m(u-s/6),Y(v+s/2),m(s/3),m(s));};
 const dia=(u,v,s,c)=>{x.fillStyle=c;x.beginPath();x.moveTo(m(u),Y(v+s));x.lineTo(m(u+s),Y(v));x.lineTo(m(u),Y(v-s));x.lineTo(m(u-s),Y(v));x.fill();};
 const chev=(u,v,s,c)=>{x.strokeStyle=c;x.lineWidth=m(s*0.35);x.beginPath();x.moveTo(m(u+s),Y(v+s));x.lineTo(m(u),Y(v));x.lineTo(m(u+s),Y(v-s));x.stroke();};
 // logo + school name (top left)
 C(0.9,H-0.75,0.42,'#ffffff');C(0.9,H-0.75,0.33,'#3d9a52');x.fillStyle='#f4c51e';x.beginPath();x.moveTo(m(0.9),Y(H-0.5));x.lineTo(m(1.12),Y(H-0.95));x.lineTo(m(0.68),Y(H-0.95));x.fill();
 x.fillStyle='#2e8a4a';x.font=`bold ${m(0.5)}px NanumGothic, sans-serif`;x.textBaseline='middle';x.fillText('서울가동초등학교',m(1.5),Y(H-0.68));
 x.font=`bold ${m(0.2)}px sans-serif`;x.fillText('SEOUL GADONG ELEMENTARY SCHOOL',m(1.5),Y(H-1.12));
 // big navy circle lower left, white ring, rings
 C(0.6,1.3,1.25,'#3b4fa3');ring(2.6,0.9,0.75,0.28,'#f7f2e8');ring(3.2,2.9,0.28,0.12,'#e84a6f');C(3.2,2.9,0.12,'#e84a6f');
 C(5.2,2.75,0.32,'#e85b8a');C(5.75,2.75,0.32,'#8f7ad8');
 // entrance zone (transparent) with half-circle porthole above
 const e0=(NN-EN1),e1=(NN-EN0);x.clearRect(m(e0),Y(2.7),m(e1-e0),m(2.7));
 C((e0+e1)/2,3.6,0.55,'#3b4fa3');x.fillStyle='#f4c51e';x.fillRect(m((e0+e1)/2-0.6),Y(3.6),m(1.2),m(0.6));ring((e0+e1)/2,3.6,0.6,0.09,'#ffffff');
 // arrows <<<<< and big purple circle (right of entrance)
 for(let k=0;k<6;k++)chev(9.6+k*0.42,H-0.9,0.22,'#ffffff');
 C(14.0,H-1.1,0.85,'#7d6cc9');C(10.2,2.0,0.35,'#ffffff');C(10.2,2.0,0.18,'#f4c51e');plus(8.6,1.3,0.55,'#8f7ad8');
 ring(11.8,1.0,0.5,0.22,'#ffffff');dia(13.2,1.2,0.6,'#3b4fa3');x.fillStyle='#f4c51e';x.beginPath();x.moveTo(m(13.2),Y(1.55));x.lineTo(m(13.55),Y(1.2));x.lineTo(m(13.2),Y(0.85));x.lineTo(m(12.85),Y(1.2));x.fill();
 C(14.9,0.9,0.75,'#ef5f8f');chev(15.9,1.3,0.45,'#3b4fa3');plus(16.2,3.0,0.5,'#ffffff');C(L-0.5,2.6,0.25,'#8f7ad8');
 // dot bands near the bottom
 x.fillStyle='#ef7a3a';for(let i=0;i<10;i++)for(let j=0;j<3;j++)x.fillRect(m(5.0+i*0.15),Y(0.6+j*0.15),m(0.07),m(0.07));});}
export function buildHall7(chunks,WALLS){const s=chunks.site;if(!s)return;const g=new THREE.Group();g.userData.kind='photo';s.group.add(g);
 const SR=WALLS.site=WALLS.site||{e:0,s:[],r:[]};
 const box=(m,x0,x1,y0,y1,n0,n1)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,n1-n0),m);b.position.set((x0+x1)/2,(y0+y1)/2,-(n0+n1)/2);b.castShadow=b.receiveShadow=true;g.add(b);return b;};
 const wp=new THREE.Vector3();
 // hide superseded pieces: old small gym mural, old thin entrance frame/awning/label, old lime box, old round 2F windows
 s.group.traverse(o=>{if(!o.isMesh||o.parent===g)return;o.getWorldPosition(wp);const x=wp.x,n=-wp.z,y=wp.y,p=o.geometry&&o.geometry.parameters||{};
  if(o.geometry.type==='PlaneGeometry'&&Math.abs(p.width-8.6)<0.01&&Math.abs(p.height-3.2)<0.01&&x>44&&x<46)o.visible=false;
  if(x>42.6&&x<45.0&&n>-47.2&&n<-42.2&&y<3.4)o.visible=false;
  if(x>39.9&&x<43.3&&n>-27&&n<-19.2&&y>0.2&&y<7.4&&!(o.geometry.type==='CylinderGeometry'))o.visible=false;
  if(o.geometry.type==='CircleGeometry'&&Math.abs(x-44.91)<0.03&&Math.abs(y-6.2)<0.05)o.visible=false;});
 // 1+2+3: full-width yellow mural wall (north = canvas left), rounded south end, porthole window near the top
 const L=NN-NS,H=TOP;const mt=muralTex(L,H);const mm=S({map:mt,transparent:true,alphaTest:0.5,side:THREE.DoubleSide,roughness:0.55});
 const mp=new THREE.Mesh(new THREE.PlaneGeometry(L,H),mm);mp.position.set(X-0.01,H/2,-(NN+NS)/2);mp.rotation.y=-Math.PI/2;g.add(mp);
 const yel=S({color:0xf4c51e,roughness:0.55});box(yel,X,X+0.35,0,H,NS,EN0);box(yel,X,X+0.35,0,H,EN1,NN);box(yel,X,X+0.35,2.7,H,EN0,EN1);
 box(S({color:0xeceae2}),X-0.05,X+0.4,H,H+0.18,NS,NN);
 const R=1.5,arc=new THREE.Mesh(new THREE.CylinderGeometry(R,R,H,24,1,true,Math.PI*1.5,Math.PI/2),S({color:0xf4c51e,side:THREE.DoubleSide,roughness:0.55}));arc.position.set(X+R,H/2,-NS);g.add(arc);
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(R+0.05,R+0.05,0.18,24,1,false,Math.PI*1.5,Math.PI/2),S({color:0xeceae2}));cap.position.set(X+R,H+0.09,-NS);g.add(cap);
 {const pw=new THREE.Mesh(new THREE.CircleGeometry(0.55,28),S({color:0x2c4f73,roughness:0.15,metalness:0.3})),pf=new THREE.Mesh(new THREE.RingGeometry(0.55,0.68,28),S({color:0xffffff}));const k=0.7071*(R+0.03);for(const q of[pw,pf]){q.position.set(X+R-k,3.9,-(NS-k));q.rotation.y=-Math.PI/4;g.add(q);}}
 SR.r.push([X-0.02,NS-0.1,X+0.4,EN0],[X-0.02,EN1,X+0.4,NN]);
 // 5: deep recessed entrance with thick yellow frame, dark ceiling, glass doors with cloud band
 {const xb=45.35,fr=S({color:0xf2be12,roughness:0.5});box(fr,X-0.35,X+0.02,0,3.05,EN0-0.35,EN0);box(fr,X-0.35,X+0.02,0,3.05,EN1,EN1+0.35);box(fr,X-0.35,X+0.02,2.7,3.05,EN0,EN1);
  const wall=S({color:0xf6d14a});box(wall,X,xb,0,2.7,EN0-0.02,EN0+0.05);box(wall,X,xb,0,2.7,EN1-0.05,EN1+0.02);box(S({color:0x2a2622}),X-0.35,xb,2.62,2.7,EN0,EN1);
  const cloud=cvT(512,256,(x,w,h)=>{x.fillStyle='#bcd7ea';x.fillRect(0,0,w,h);x.fillStyle='#e9f2fa';for(let i=0;i<7;i++){const cx=i*80+20;x.beginPath();x.arc(cx,h*0.62,40,0,7);x.arc(cx+38,h*0.55,46,0,7);x.arc(cx+70,h*0.66,34,0,7);x.fill();}x.fillRect(0,h*0.7,w,h*0.3);x.fillStyle='#6c86b8';x.font='bold 34px NanumGothic, sans-serif';x.fillText('맛있는 급식실',150,50);});
  // (glass doors stand open now: entrance to the split landing) const gl=new THREE.Mesh(new TH
  // (glass doors stand open now: entrance to the split landing) const cb=new THREE.Mesh(new TH
  // (glass doors stand open now: entrance to the split landing) box(S({color:0x8a9096,metalnes
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(xb-X+0.4,EN1-EN0),S({color:0x7b7f83}));fl.rotation.x=-Math.PI/2;fl.position.set((X+xb)/2-0.2,0.012,-(EN0+EN1)/2);g.add(fl);}
 // 4: arch-top 2F windows in the brick band above the mural
 {const sh=new THREE.Shape();sh.moveTo(-0.5,-0.6);sh.lineTo(0.5,-0.6);sh.lineTo(0.5,0.2);sh.absarc(0,0.2,0.5,0,Math.PI,false);sh.lineTo(-0.5,-0.6);
  const sf=new THREE.Shape();sf.moveTo(-0.62,-0.72);sf.lineTo(0.62,-0.72);sf.lineTo(0.62,0.2);sf.absarc(0,0.2,0.62,0,Math.PI,false);sf.lineTo(-0.62,-0.72);
  const gw=new THREE.ShapeGeometry(sh,16),gf=new THREE.ShapeGeometry(sf,16),mw=S({color:0x2e4a5c,roughness:0.2,metalness:0.3}),mf=S({color:0xf1efe8});
  for(let n=-54;n<=-26;n+=2.8){const f=new THREE.Mesh(gf,mf);f.position.set(44.9,6.3,-n);f.rotation.y=-Math.PI/2;g.add(f);const w=new THREE.Mesh(gw,mw);w.position.set(44.89,6.3,-n);w.rotation.y=-Math.PI/2;g.add(w);}}
 // 7: 강당 entrance walkway (photo 182): straight curved translucent green roof on posts, tiled floor, ending at the school door
 {const N0=-37.4,N1=-34.1,x0=34.0,x1=42.2,post=S({color:0xb3bac0,metalness:0.6,roughness:0.3});
  const rf=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.1,x1-x0,24,1,true,Math.PI/2-0.75,1.5),S({color:0x2f8f78,transparent:true,opacity:0.5,side:THREE.DoubleSide,roughness:0.25}));rf.rotation.z=Math.PI/2;rf.rotation.x=0;rf.position.set((x0+x1)/2,1.25,-(N0+N1)/2);g.add(rf);
  const ribs=S({color:0x56606a,metalness:0.5});for(let x=x0;x<=x1+0.01;x+=(x1-x0)/6){for(const n of[N0+0.05,N1-0.05])box(post,x-0.05,x+0.05,0,2.75,n-0.05,n+0.05);}
  const tl=cvT(256,256,(x,w,h)=>{x.fillStyle='#c9c3b8';x.fillRect(0,0,w,h);const c=['#d8d2c6','#bfb8ab','#e3ddd2','#a9b6b9'];for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.fillStyle=c[(i*7+j*3)%4];x.fillRect(i*32+1,j*32+1,30,30);}});tl.wrapS=tl.wrapT=THREE.RepeatWrapping;tl.repeat.set((x1-x0)/2,(N1-N0)/2);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,N1-N0),S({map:tl,roughness:0.85}));fl.rotation.x=-Math.PI/2;fl.position.set((x0+x1)/2,0.014,-(N0+N1)/2);g.add(fl);
  // 누리관 passage roof: lighter, clearly translucent
  s.group.traverse(o=>{if(o.isMesh&&o.geometry.type==='CylinderGeometry'&&Math.abs((o.geometry.parameters.radiusTop||0)-2.0)<0.01&&o.material&&o.material.opacity===0.85){o.material=o.material.clone();o.material.color.set(0x3fa58a);o.material.opacity=0.5;}});}
 // 8: hall roof: smaller west overhang and lower profile
 {const r=chunks.hall_roof;if(r&&!r.group.userData.r7){const a=65.7,sx=(65.7-44.6)/(65.7-41.6),y0=10.4,sy=0.5;r.group.scale.x*=sx;r.group.position.x+=a*(1-sx);r.group.scale.y*=sy;r.group.position.y+=y0*(1-sy);r.group.userData.r7=1;}}
 // 9: brick stair tower with white bands and a sloped roof at the north end
 {const br=cvT(256,256,(x,w,h)=>{x.fillStyle='#6d2f24';x.fillRect(0,0,w,h);for(let j=0;j<16;j++)for(let i=0;i<8;i++){x.fillStyle=['#7a3428','#63291f','#83402f'][(i+j*3)%3];x.fillRect(i*32+(j%2)*16,j*16,30,14);}});br.wrapS=br.wrapT=THREE.RepeatWrapping;br.repeat.set(2,2);
  const bm=S({map:br,roughness:0.9}),wh=S({color:0xf0ede4});const x0=45.4,x1=49.6,n0=-19.4,n1=-12.6;box(bm,x0,x1,9.6,13.4,n0,n1);for(const y of[10.6,12.4])box(wh,x0-0.03,x1+0.03,y,y+0.18,n0-0.03,n1+0.03);
  const fw=new THREE.Mesh(new THREE.PlaneGeometry(n1-n0,6.0),bm);fw.position.set(x0-0.04,6.6+3.0-0.0,-(n0+n1)/2);fw.rotation.y=-Math.PI/2;g.add(fw);for(const y of[7.2])box(wh,x0-0.09,x0-0.04,y,y+0.18,n0,n1);
  const rg=new THREE.BufferGeometry();const v=[x0-0.3,13.4,-(n0-0.3), x1+0.3,14.4,-(n0-0.3), x1+0.3,14.4,-(n1+0.3), x0-0.3,13.4,-(n1+0.3)];rg.setAttribute('position',new THREE.Float32BufferAttribute(v,3));rg.setIndex([0,1,2,0,2,3]);rg.computeVertexNormals();g.add(new THREE.Mesh(rg,S({color:0x3d4246,side:THREE.DoubleSide,metalness:0.4})));}
 // 11: 누리관 (indoor baseball hall): replace horizontal window bands with tall narrow vertical slits
 {const b=chunks.baseball;if(b){b.group.traverse(o=>{if(o.isMesh&&/baseball__(glass|frameW|frameT|white)$/.test(o.name))o.visible=false;});
  const gm=S({color:0x2b3d4c,roughness:0.15,metalness:0.4}),fm=S({color:0xd9dde0});const x0=33.4,x1=63.7,n0=-87.8,n1=-69.6;
  const slit=(x,n,ry)=>{const f=new THREE.Mesh(new THREE.PlaneGeometry(0.75,4.3),fm);f.position.set(x,3.9,-n);f.rotation.y=ry;g.add(f);const w=new THREE.Mesh(new THREE.PlaneGeometry(0.55,4.1),gm);w.position.set(x+Math.sin(ry)*0.01,3.9,-n+Math.cos(ry)*0.01);w.rotation.y=ry;g.add(w);};
  for(let n=n0+2.5;n<=n1-2;n+=3.2)slit(x0-0.03,n,-Math.PI/2);for(let x=x0+2.5;x<=x1-2;x+=3.4){slit(x,n1+0.03,Math.PI);slit(x,n0-0.03,0);}for(let n=n0+2.5;n<=n1-2;n+=3.2)slit(x1+0.03,n,Math.PI/2);}}
}
