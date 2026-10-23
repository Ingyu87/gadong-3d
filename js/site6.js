import * as THREE from 'three';
// Phase 6 props (audit E): 누리관 lettering + net fence, pitcher mound, 수돗가, benches, '꿈너머 꿈' tile wall,
// milk cooler, public phone, fire hydrant box, umbrella stand
const S=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:0.75},o));
function cvT(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
export function buildProps6(chunks,WALLS,DROP){const D=DROP||2.7;
 const grp=(ck)=>{const c=chunks[ck];if(!c)return null;const g=new THREE.Group();g.userData.kind='photo';c.group.add(g);return g;};
 const mk=(g)=>(m,x0,x1,y0,y1,n0,n1)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,n1-n0),m);b.position.set((x0+x1)/2,(y0+y1)/2,-(n0+n1)/2);b.castShadow=b.receiveShadow=true;g.add(b);return b;};
 const pl=(g,m,w,h,x,y,n,ry)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);p.position.set(x,y,-n);p.rotation.y=ry;g.add(p);return p;};
 const SR=WALLS.site=WALLS.site||{e:0,s:[],r:[]};
 const g=grp('site');if(g){const box=mk(g);
  // 누리관 lettering on the west face of the indoor baseball hall, green net fence along the field east edge
  const nt=cvT(512,160,(x,w,h)=>{x.fillStyle='#fff';x.font='bold 120px NanumGothic, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('누리관',w/2,h/2);});
  pl(g,S({map:nt,transparent:true}),3.2,1.0,37.9,4.2,-65,-Math.PI/2);
  const net=S({map:cvT(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#2f7a45';x.lineWidth=2;for(let i=0;i<=w;i+=8){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke();}}),transparent:true,side:THREE.DoubleSide,alphaTest:0.3});
  net.map.wrapS=net.map.wrapT=THREE.RepeatWrapping;net.map.repeat.set(26,6);const nm=pl(g,net,26,6,34.6,-D+3,-75,Math.PI/2);
  const post=S({color:0x6f757b,metalness:0.6});for(let n=-88;n<=-62;n+=3.25)box(post,34.5,34.7,-D,-D+6,n-0.1,n+0.1);SR.r.push([34.4,-88,34.8,-62]);
  // pitcher mound + home plate on the field
  const md=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.9,0.18,32),S({color:0xa9744a}));md.position.set(-18,-D+0.09,75);g.add(md);
  const pr=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.02,0.15),S({color:0xffffff}));pr.position.set(-18,-D+0.19,75);g.add(pr);
  // 수돗가 behind the field (east end of the pergola)
  const tile=S({color:0x7fb2c9,roughness:0.4}),steel=S({color:0xc9ced3,metalness:0.8,roughness:0.25});box(tile,29.5,34,0,0.8,-94.4,-93.2);box(S({color:0xdfe6ea}),29.6,33.9,0.6,0.8,-94.3,-93.3);
  for(let i=0;i<5;i++){const x=30+i*0.9;box(steel,x-0.03,x+0.03,0.8,1.15,-94.0,-93.9);box(steel,x-0.03,x+0.03,1.1,1.15,-93.9,-93.7);}SR.r.push([29.5,-94.4,34,-93.2]);
  // benches under the pergola
  const wd=S({color:0x9a6a40}),leg=S({color:0x333});for(const x of[-18,-10,-2,6,14,22]){box(wd,x-0.9,x+0.9,0.42,0.47,-94.3,-93.9);box(wd,x-0.9,x+0.9,0.55,0.85,-94.35,-94.3);for(const dx of[-0.8,0.8])box(leg,x+dx-0.04,x+dx+0.04,0,0.42,-94.3,-93.9);SR.r.push([x-0.9,-94.35,x+0.9,-93.9]);}
  // '꿈너머 꿈' tile wall beside the storage door under the 구령대
  const kt=cvT(768,384,(x,w,h)=>{const T=32;for(let i=0;i<w/T;i++)for(let j=0;j<h/T;j++){const r=Math.sin(i*12.9898+j*78.233)*43758.5;const f=r-Math.floor(r);x.fillStyle=['#f6d65a','#7ac0e8','#f49ab9','#9ad27a','#ffffff','#c7a0e8'][Math.floor(f*6)];x.fillRect(i*T+1,j*T+1,T-2,T-2);}
   x.fillStyle='rgba(255,255,255,0.85)';x.fillRect(w*0.18,h*0.34,w*0.64,h*0.32);x.fillStyle='#24456e';x.font='bold 96px NanumGothic, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('꿈너머 꿈',w/2,h/2);});
  pl(g,S({map:kt}),3.0,1.5,3.9,-D+1.2,-18.64,0);}
 const m1=grp('main_1F');if(m1){const box=mk(m1);const W=WALLS.main_1F;
  // milk cooler beside the fish tank, umbrella stand at the entrance, fire hydrant box on the corridor wall, public phone outside
  box(S({color:0xeef3f6}),6.1,6.65,0,0.8,16.95,17.55);pl(m1,S({map:cvT(256,96,(x,w,h)=>{x.fillStyle='#2d7fc4';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='bold 54px NanumGothic, sans-serif';x.textAlign='center';x.fillText('우유 보관함',w/2,64);})}),0.5,0.18,6.09,0.6,17.25,-Math.PI/2);W&&W.r.push([6.1,16.95,6.65,17.55]);
  const us=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.2,0.55,16,1,true),S({color:0xf2c230,side:THREE.DoubleSide}));us.position.set(3.1,0.28,-13.5);m1.add(us);W&&W.r.push([2.85,13.25,3.35,13.75]);
  box(S({color:0xc8322c}),-1.6,-0.8,0.3,1.5,20.47,20.65);pl(m1,S({map:cvT(256,128,(x,w,h)=>{x.fillStyle='#c8322c';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='bold 64px NanumGothic, sans-serif';x.textAlign='center';x.fillText('소화전',w/2,84);})}),0.6,0.3,-1.2,1.25,20.66,Math.PI);
  box(S({color:0x2e6fb0}),8.2,8.9,1.0,1.9,12.6,12.92);box(S({color:0x222}),8.35,8.75,1.15,1.6,12.56,12.6);W&&W.r.push([8.2,12.6,8.9,12.92]);}}
