import * as THREE from 'three';
function cv(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
const rnd=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647;})();
// brick: tile = 1.0m x 0.6m (4 bricks x 8 courses: 0.25 x 0.075)
export const brick=()=>{const t=cv(1024,616,(x,w,h)=>{x.fillStyle='#6f655d';x.fillRect(0,0,w,h);const bw=256,bh=77;
 for(let r=0;r<8;r++)for(let c=-1;c<5;c++){const ox=(r%2)*bw/2;const v=rnd();const R=92+v*26|0,G=50+v*14|0,B=45+v*12|0;
  x.fillStyle=`rgb(${R},${G},${B})`;x.fillRect(c*bw+ox+3,r*bh+3,bw-6,bh-6);
  for(let k=0;k<40;k++){x.fillStyle=`rgba(${rnd()<.5?40:200},${30},${20},0.08)`;x.fillRect(c*bw+ox+5+rnd()*(bw-14),r*bh+5+rnd()*(bh-14),4,3);}}});
 t.repeat.set(1/1.0,1/0.6);return t;};
export const wood=(base='#a4703f',pw=0.15,pl=1.2,size=1.2)=>{const t=cv(1024,1024,(x,w,h)=>{const n=Math.round(size/pw),ph=h/n;
 for(let i=0;i<n;i++){const off=rnd()*w;for(let j=-1;j<2;j++){const v=rnd()*0.1-0.05;x.fillStyle=shade(base,v);x.fillRect(off+j*w*(pl/size),i*ph,w*(pl/size)-3,ph-2);
  for(let g=0;g<14;g++){x.strokeStyle=`rgba(60,35,15,${0.05+rnd()*0.08})`;x.lineWidth=1+rnd()*2;x.beginPath();const yy=i*ph+rnd()*ph;x.moveTo(off+j*w,yy);x.bezierCurveTo(off+j*w+300,yy+rnd()*6-3,off+j*w+600,yy+rnd()*6-3,off+j*w+w,yy);x.stroke();}}
  x.fillStyle='rgba(40,25,10,0.3)';x.fillRect(0,i*ph+ph-1,w,1);}});t.repeat.set(1/size,1/size);return t;};
function shade(hex,v){const c=new THREE.Color(hex);c.offsetHSL(0,0,v);return '#'+c.getHexString();}
export const ceilTile=()=>{const t=cv(512,512,(x,w,h)=>{x.fillStyle='#f3f2ee';x.fillRect(0,0,w,h);for(let i=0;i<2600;i++){x.fillStyle=`rgba(120,115,105,${0.25+rnd()*0.35})`;x.beginPath();x.arc(rnd()*w,rnd()*h,1+rnd()*1.3,0,7);x.fill();}
 x.strokeStyle='#d6d4ce';x.lineWidth=4;x.strokeRect(0,0,w,h);});t.repeat.set(1/0.6,1/0.6);return t;};
export const noise=(base,amt=0.06,size=4)=>{const t=cv(512,512,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){x.fillStyle=`rgba(${rnd()<.5?0:255},${rnd()<.5?0:255},${rnd()<.5?0:255},${amt*rnd()})`;x.fillRect(rnd()*w,rnd()*h,3,3);}});t.repeat.set(1/size,1/size);return t;};
export const textTex=(txt,{w=1024,h=256,font='bold 180px NanumGothic, sans-serif',fg='#fff',bg=null}={})=>cv(w,h,(x)=>{if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h);}x.fillStyle=fg;x.font=font;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+8);});
export const flag=()=>cv(600,400,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,600,400);x.save();x.translate(300,200);x.rotate(Math.atan2(2,3));
 x.fillStyle='#cd2e3a';x.beginPath();x.arc(0,0,100,Math.PI,0);x.fill();x.fillStyle='#0047a0';x.beginPath();x.arc(0,0,100,0,Math.PI);x.fill();
 x.fillStyle='#cd2e3a';x.beginPath();x.arc(-50,0,50,0,Math.PI*2);x.fill();x.fillStyle='#0047a0';x.beginPath();x.arc(50,0,50,0,Math.PI*2);x.fill();x.restore();
 x.fillStyle='#000';[[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([a,b])=>{x.save();x.translate(300+a*190,200+b*125);x.rotate(-a*b*Math.atan2(2,3)+Math.PI/2);for(let i=0;i<3;i++)x.fillRect(-50,-36+i*26,100,16);x.restore();});});
export const board=()=>cv(512,340,(x)=>{x.fillStyle='#f7f7f4';x.fillRect(0,0,512,340);x.strokeStyle='#b9bcc0';x.lineWidth=14;x.strokeRect(0,0,512,340);
 const cols=['#f2d16b','#9fd3e8','#f4a6a6','#c8e6a0','#ffffff'];for(let i=0;i<9;i++){x.fillStyle=cols[i%5];x.fillRect(30+(i%5)*92,40+Math.floor(i/5)*130,70,95);x.fillStyle='#555';for(let k=0;k<5;k++)x.fillRect(38+(i%5)*92,55+Math.floor(i/5)*130+k*14,50,4);}});
export const terrazzo=()=>{const t=cv(1024,1024,(x,w,h)=>{x.fillStyle='#c9c5bb';x.fillRect(0,0,w,h);const cols=['#8d8a84','#e9e6df','#6f6a62','#b3aa98','#d8d2c4','#4f4c48','#a39a8a'];
 for(let i=0;i<14000;i++){x.fillStyle=cols[(rnd()*cols.length)|0];x.globalAlpha=0.5+rnd()*0.5;const r=1+rnd()*rnd()*7;x.beginPath();x.ellipse(rnd()*w,rnd()*h,r,r*(0.5+rnd()*0.5),rnd()*3,0,7);x.fill();}
 x.globalAlpha=1;x.strokeStyle='rgba(80,80,80,0.35)';x.lineWidth=3;x.strokeRect(0,0,w,h);x.beginPath();x.moveTo(w/2,0);x.lineTo(w/2,h);x.moveTo(0,h/2);x.lineTo(w,h/2);x.stroke();for(const[a,b]of[[0,0],[w/2,0],[0,h/2],[w/2,h/2]]){x.fillStyle=`rgba(${rnd()<.5?255:0},${rnd()<.5?255:0},${rnd()<.5?255:0},0.03)`;x.fillRect(a,b,w/2,h/2);}});t.repeat.set(1/1.2,1/1.2);return t;};
export const slideDoor=()=>{const c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d');x.fillStyle='#a8763f';x.fillRect(0,0,256,512);
 for(let g=0;g<60;g++){x.strokeStyle=`rgba(70,40,15,${0.05+rnd()*0.1})`;x.lineWidth=1+rnd()*2;x.beginPath();const xx=rnd()*256;x.moveTo(xx,0);x.bezierCurveTo(xx+rnd()*8-4,170,xx+rnd()*8-4,340,xx,512);x.stroke();}
 x.strokeStyle='#6e4a26';x.lineWidth=10;x.strokeRect(5,5,246,502);x.fillStyle='#e9eef0';x.fillRect(58,70,140,150);x.fillStyle='#7f9fb0';x.fillRect(66,78,124,134);x.fillStyle='rgba(255,255,255,0.35)';x.beginPath();x.moveTo(66,78);x.lineTo(130,78);x.lineTo(66,150);x.fill();
 x.fillStyle='#c8ccd0';x.fillRect(212,250,14,60);x.fillStyle='rgba(40,25,10,0.25)';x.fillRect(5,440,246,62);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;};
