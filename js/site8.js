import * as THREE from 'three';
// 강당/급식실 동 levels (user 12:13 + photos 104/108/112/311/113/198/60):
// entry = yellow mural entrance on the field apron (E = field level -2.7)
// inside it a split landing at E: DOWN 0.9 (6 steps) to the 급식실 floor (-3.6), UP 2.7 (18 steps) to the 강당 floor (0 = main-building level)
// => the whole hall block sits one storey (3.6) lower than modelled; site-side extras on the apron sit 2.7 lower.
export const HALL_DY=-3.6;const APRON=-2.7;
export function sinkHall(chunks,WALLS,STAIRS,DOORS,doorIMs){
 const DY=HALL_DY;const names=['hall_1F','hall_2F','hall_roof'];
 for(const k of names){const c=chunks[k];if(!c)continue;c.group.position.y+=DY;c.group.updateMatrixWorld(true);c.box=null;if(WALLS[k])WALLS[k].e+=DY;}
 // H2 was an outdoor stair from ground to the 2F east door; with 2F now at ground level it is not needed
 for(let i=STAIRS.length-1;i>=0;i--){const st=STAIRS[i];if(st.bld!=='hall')continue;if(st.id==='H2'){STAIRS.splice(i,1);continue;}st.e=(st.e||0)+DY;for(const f of st.flights){f.y0+=DY;if(f.y1!=null)f.y1+=DY;}}
 const seen=new Set();for(const d of DOORS||[])if(/^hall_/.test(d.c)&&!seen.has(d)){seen.add(d);d.e+=DY;}
 for(const im of doorIMs||[])for(const d of im.userData.doors||[])if(/^hall_/.test(d.c)&&!seen.has(d)){seen.add(d);d.e+=DY;}
 const s=chunks.site;if(!s)return;s.group.updateMatrixWorld(true);
 // late-built site extras: on the new apron strip (x35..45) and the yellow mural / entrance frame -> apron; inside the hall footprint -> with the hall
 const B=new THREE.Box3(),mv=[];
 s.group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||/site__|_field$/.test(o.name))return;let p=o;while(p){if(p.name==='fieldTerrain')return;p=p.parent;}
  B.setFromObject(o);if(B.isEmpty()||B.min.y<-0.3)return;const x0=B.min.x,x1=B.max.x,n0=-B.max.z,n1=-B.min.z;
  if(x0>=34.8&&x1<=45.45&&n0>=-90&&n1<=-18.5)mv.push([o,APRON]);
  else if(x0>=45.45&&x1<=65.6&&n0>=-60.4&&n1<=-13.2)mv.push([o,DY]);});
 for(const [o,d] of mv)o.position.y+=d;
 // split-landing dressing: solid plinth under the landing, balustrades on the 강당 flight (1F side) and 2F guard rail round the stair hole
 const g=new THREE.Group();g.name='hallStair8';s.group.add(g);
 const S=c=>new THREE.MeshStandardMaterial({color:c,roughness:0.6});const conc=S(0xcfcbc2),rail=new THREE.MeshStandardMaterial({color:0x2b2e33,metalness:0.5,roughness:0.4}),glass=new THREE.MeshStandardMaterial({color:0xbfd8e2,transparent:true,opacity:0.35,roughness:0.1});
 const box=(m,x0,x1,y0,y1,n0,n1)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,n1-n0),m);b.position.set((x0+x1)/2,(y0+y1)/2,-(n0+n1)/2);b.castShadow=b.receiveShadow=true;g.add(b);return b;};
 const F=-3.6,E=APRON,T=0;
 box(conc,44.95,47.0,F,E-0.02,-45.6,-43.45);
 // stringer wall under the up flight (closes the triangle seen from the dining room)
 {const n0=-51.0,n1=-45.6,N=9;for(let i=0;i<N;i++){const a=n1-(i)*(n1-n0)/N,b=n1-(i+1)*(n1-n0)/N;const y=E+(T-E)*(i+1)/N;box(conc,46.85,46.95,F,y-0.2,b,a);}
  for(let i=0;i<=N;i++){const nn=n1-i*(n1-n0)/N,y=E+(T-E)*i/N;box(rail,46.88,46.94,y,y+1.0,nn-0.03,nn+0.03);}
  const L=Math.hypot(n1-n0,T-E),ang=Math.atan2(T-E,n1-n0);const hr=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,L),rail);hr.position.set(46.91,(E+T)/2+1.0,-(n0+n1)/2);hr.rotation.x=-ang;g.add(hr);
  const gp=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.85,L),glass);gp.position.set(46.91,(E+T)/2+0.5,-(n0+n1)/2);gp.rotation.x=-ang;g.add(gp);}
 // 2F guard rail round the hole
 box(rail,46.85,46.95,T+0.98,T+1.04,-51.0,-45.5);box(rail,45.3,46.95,T+0.98,T+1.04,-45.6,-45.5);box(glass,46.88,46.92,T+0.05,T+0.95,-51.0,-45.5);box(glass,45.3,46.95,T+0.05,T+0.95,-45.58,-45.52);
 for(const n of[-51.0,-49.2,-47.4,-45.55])box(rail,46.86,46.94,T,T+1.0,n-0.03,n+0.03);
 // landing edge rail beside the 6-step drop to the 급식실 (north side is the wall)
 window.__hallLevels={entry:E,dining:F,hall:T,main:0,field:-2.7};
}
// 급식실 back door (photos 248/299/21/155/184): green arched covered corridor at main-building level along the hall east wall,
// lime wall + railing, then a straight 24-step stair down in a trench to the east door of the 급식실 (-3.6)
export function backCorridor(chunks,WALLS){const s=chunks.site;if(!s)return;const g=new THREE.Group();g.name='backCorr8';s.group.add(g);
 const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:0.6,...o});const lime=M(0xb9cf3a),conc=M(0xc9c6bf),rail=M(0x8d949b,{metalness:0.6,roughness:0.35}),mat=M(0x3d4044,{roughness:0.9}),
  can=M(0x2f8f7a,{transparent:true,opacity:0.55,side:THREE.DoubleSide,roughness:0.3}),frame=M(0x2e6e5f,{metalness:0.4});
 const box=(m,x0,x1,y0,y1,n0,n1)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,n1-n0),m);b.position.set((x0+x1)/2,(y0+y1)/2,-(n0+n1)/2);b.castShadow=b.receiveShadow=true;g.add(b);return b;};
 const X0=65.5,X1=67.5,N0=-55.3,N1=-12.9,NT=-40.0,F=-3.6;
 box(lime,67.35,67.5,F,2.6,N0,NT);box(lime,X0,X1,F,0.0,N0,N0+0.1);box(conc,65.5,65.56,F,0,N0,NT);
 box(mat,65.7,67.2,0.005,0.015,NT,N1);// rubber runner on the corridor (photo 299)
 for(let n=NT;n<=N1-0.5;n+=2.0)box(rail,67.4,67.46,0,1.0,n-0.03,n+0.03);box(rail,67.38,67.48,0.98,1.04,NT,N1);box(rail,67.38,67.48,0.5,0.54,NT,N1);
 // handrail down the stair on the lime wall
 {const L=Math.hypot(7.2,3.6),a=Math.atan2(3.6,7.2);const h=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,L),rail);h.position.set(67.28,-1.8+0.9,-(-47.2-40.0)/2);h.rotation.x=a;g.add(h);}
 // arched canopy
 const R=(X1-X0)/2+0.1,len=N1-N0;const arc=new THREE.Mesh(new THREE.CylinderGeometry(R,R,len,20,1,true,-Math.PI/2,Math.PI),can);arc.rotation.x=Math.PI/2;arc.scale.set(1,1,0.45);arc.position.set((X0+X1)/2,2.75,-(N0+N1)/2);g.add(arc);
 for(let n=N0;n<=N1+0.01;n+=3.0){box(frame,X1+0.02,X1+0.1,0,2.75,n-0.04,n+0.04);const r=new THREE.Mesh(new THREE.TorusGeometry(R,0.04,6,20,Math.PI),frame);r.scale.set(1,0.45,1);r.position.set((X0+X1)/2,2.75,-n);g.add(r);}
 // collider: rail beside the trench at corridor level is the lime wall (hall_1F covers below); site rect blocks walkers at 0
 WALLS.site.r.push([67.35,-55.3,67.55,-40.0],[65.5,-55.45,67.55,-55.2]);
}

// Phase 2: 누리관 (indoor baseball hall) + the strip behind the field sit at field level (-2.7), no terrace (photos 75,273,43,146,232)
export function sinkNuri(chunks,WALLS,STAIRS,DOORS,doorIMs){
 const D=APRON;const c=chunks.baseball;if(c){c.group.position.y+=D;c.group.updateMatrixWorld(true);c.box=null;if(WALLS.baseball)WALLS.baseball.e+=D;}
 for(const st of STAIRS||[])if(st.bld==='baseball'){st.e=(st.e||0)+D;for(const f of st.flights){f.y0+=D;if(f.y1!=null)f.y1+=D;}}
 const seen=new Set();for(const d of [...(DOORS||[]),...(doorIMs||[]).flatMap(im=>im.userData.doors||[])])if(/^baseball/.test(d.c)&&!seen.has(d)){seen.add(d);d.e+=D;}
 const s=chunks.site;if(!s)return;s.group.updateMatrixWorld(true);
 const R=[[-37,-116.7,45,-90],[45,-116.7,84.7,-60.3],[33,-88.5,45,-60.3]];const B=new THREE.Box3(),mv=[];
 s.group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||/site__|_field$/.test(o.name))return;let p=o;while(p){if(p.name==='fieldTerrain'||p.name==='nuri8')return;p=p.parent;}
  B.setFromObject(o);if(B.isEmpty()||B.min.y<-0.3)return;const x0=B.min.x,x1=B.max.x,n0=-B.max.z,n1=-B.min.z;
  if(R.some(r=>x0>=r[0]-0.3&&x1<=r[2]+0.3&&n0>=r[1]-0.3&&n1<=r[3]+0.3))mv.push(o);});
 for(const o of mv)o.position.y+=D;
 // artificial-grass strip along the 누리관 north side (photo 273)
 const g=new THREE.Group();g.name='nuri8';s.group.add(g);
 const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');x.fillStyle='#3f9a4a';x.fillRect(0,0,128,128);for(let i=0;i<900;i++){x.fillStyle=Math.random()<0.5?'#4cab55':'#358640';x.fillRect(Math.random()*128,Math.random()*128,1.5,3);}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(15,2);t.colorSpace=THREE.SRGBColorSpace;
 const turf=new THREE.Mesh(new THREE.PlaneGeometry(30.5,3.2),new THREE.MeshStandardMaterial({map:t,roughness:0.95}));turf.rotation.x=-Math.PI/2;turf.position.set(48.8,D+0.015,68.0);turf.receiveShadow=true;g.add(turf);
 const lime=new THREE.MeshStandardMaterial({color:0xe9e9e4});const ln=new THREE.Mesh(new THREE.PlaneGeometry(30.5,0.08),lime);ln.rotation.x=-Math.PI/2;ln.position.set(48.8,D+0.018,66.45);g.add(ln);
 return mv.length;}

// 후문 covered walkway (photos 182, 90, 249): the green arched canopy continues from the back corridor north along the east edge
// (x65.5..67.5) to n 40.5, then turns west to the 후문 gate (x59.7, n43.5). Paver floor, steel posts every 3 m, on main level (0).
export function hooMunWalk(chunks){const s=chunks.site;if(!s)return;const g=new THREE.Group();g.name='hoomun8';s.group.add(g);
 const can=new THREE.MeshStandardMaterial({color:0x2f7d5a,transparent:true,opacity:0.8,side:THREE.DoubleSide,roughness:0.35});
 const post=new THREE.MeshStandardMaterial({color:0x8a9096,metalness:0.6,roughness:0.4});
 const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');x.fillStyle='#b9b3a6';x.fillRect(0,0,128,128);const C=['#a59f92','#c9c2b4','#9fb0b8','#c7a9a0'];
 for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.fillStyle=C[(i*3+j*5)%4];x.fillRect(i*16+1,j*16+1,14,14);}const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;
 const seg=(x0,x1,n0,n1)=>{const alongN=(n1-n0)>(x1-x0),len=alongN?n1-n0:x1-x0,w=alongN?x1-x0:n1-n0,cx=(x0+x1)/2,cn=(n0+n1)/2;
  const a=new THREE.Mesh(new THREE.CylinderGeometry(w/2+0.1,w/2+0.1,len,20,1,true,-Math.PI/2,Math.PI),can);if(alongN)a.rotation.x=Math.PI/2;else{a.rotation.z=Math.PI/2;a.rotation.y=0;}
  a.scale.set(1,1,1);if(alongN)a.scale.z=0.45;else a.scale.x=1;a.position.set(cx,2.75,-cn);if(!alongN){a.rotation.set(0,0,Math.PI/2);a.scale.set(1,1,0.45);} g.add(a);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(alongN?w:len,alongN?len:w),new THREE.MeshStandardMaterial({map:t.clone(),roughness:0.8}));fl.material.map.needsUpdate=true;fl.material.map.repeat.set((alongN?w:len)/2,(alongN?len:w)/2);fl.rotation.x=-Math.PI/2;fl.position.set(cx,0.012,-cn);fl.receiveShadow=true;g.add(fl);
  for(let u=0;u<=len+0.01;u+=3){for(const side of[0,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.75,8),post);
   if(alongN)p.position.set(side?x1-0.05:x0+0.05,1.375,-(n0+u));else p.position.set(x0+u,1.375,-(side?n1-0.05:n0+0.05));p.castShadow=true;g.add(p);}}};
 seg(65.5,67.5,-12.9,40.5);seg(58.6,65.5,38.5,40.5);
 // 급식실 north 1F: no doors in the photos (that face is below the 후문-side grade), so the 4 fake door openings are walled shut
 const wl=new THREE.MeshStandardMaterial({color:0xe9e4d6,roughness:0.9});for(const[a,b]of[[48.7,50.2],[51.05,52.65],[53.45,55.0],[60.55,62.05]]){const m=new THREE.Mesh(new THREE.BoxGeometry(b-a,2.6,0.3),wl);m.position.set((a+b)/2,-3.6+1.3,13.32);g.add(m);}}
