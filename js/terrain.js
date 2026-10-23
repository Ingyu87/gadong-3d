import * as THREE from 'three';
// 운동장 is ~2.7 m below the 앞마당 (photos 7,16,158,231,66,277,280,348): stepped wooden stands under the striped canopies,
// wide concrete steps elsewhere, white retaining wall with a storage door under the 구령대, retaining walls + black railing round the field.
export const DROP=2.7;
export const FIELD={x0:-37,x1:35,n0:-90,n1:-12.5,top:-18.6};
const S=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:0.8},o));
function clipMat(m,inside){const k=m.clone();const F=FIELD;k.onBeforeCompile=sh=>{sh.vertexShader='varying vec3 vWPc;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWPc=(modelMatrix*vec4(transformed,1.0)).xyz;');
 const cond=`(vWPc.x>${F.x0.toFixed(2)}&&vWPc.x<${F.x1.toFixed(2)}&&-vWPc.z>${F.n0.toFixed(2)}&&-vWPc.z<${F.n1.toFixed(2)})`;
 sh.fragmentShader='varying vec3 vWPc;\n'+sh.fragmentShader.replace('void main() {','void main() {\n if('+(inside?'!':'')+cond+')discard;');};k.customProgramCacheKey=()=>'clip'+inside;return k;}
export function sinkField(chunks,WALLS){const c=chunks.site;if(!c)return;const F=FIELD,D=DROP;const g=new THREE.Group();g.name='fieldTerrain';
 const ground=[];c.group.traverse(o=>{if(o.isMesh&&/site__(dirt|line|paving|asphalt)/.test(o.name))ground.push(o);});
 for(const o of ground){const low=o.clone();low.material=clipMat(o.material,true);o.material=clipMat(o.material,false);low.position.y-=D;low.name=o.name+'_field';low.receiveShadow=true;o.parent.add(low);}
 // lower loose objects that stand fully on the field part (goals, lines props, trees ...)
 const inF=(x,n)=>x>F.x0+0.2&&x<F.x1-0.2&&n>F.n0+0.2&&n<F.top-0.1;const B=new THREE.Box3(),M=new THREE.Matrix4(),P=new THREE.Vector3();
 c.group.updateMatrixWorld(true);const mv=[];c.group.traverse(o=>{if(!o.isMesh||ground.includes(o)||/_field$/.test(o.name))return;
  if(o.isInstancedMesh){let ch=false;for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);P.setFromMatrixPosition(M).applyMatrix4(o.matrixWorld);if(inF(P.x,-P.z)){M.elements[13]-=D;o.setMatrixAt(i,M);ch=true;}}if(ch){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere&&o.computeBoundingSphere();}return;}
  B.setFromObject(o);if(B.isEmpty())return;if(inF(B.min.x,-B.max.z)&&inF(B.max.x,-B.min.z)&&B.min.y>-0.3)mv.push(o);});
 for(const o of mv)o.position.y-=D;
 const conc=S({color:0xbdbab3}),coping=S({color:0x9c9a95}),white=S({color:0xf1f1ee,roughness:0.7}),wood=S({color:0x8a4f34,roughness:0.65}),woodR=S({color:0x6e3b27,roughness:0.7}),rail=S({color:0x1c1d20,metalness:0.5,roughness:0.4}),door=S({color:0x3a3f46,roughness:0.5}),post=S({color:0x6f757b,metalness:0.6,roughness:0.4});
 const box=(m,x0,x1,y0,y1,n0,n1)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,n1-n0),m);b.position.set((x0+x1)/2,(y0+y1)/2,-(n0+n1)/2);b.castShadow=b.receiveShadow=true;g.add(b);return b;};
 WALLS.site=WALLS.site||{e:0,s:[],r:[]};const PL=WALLS.site.plat=WALLS.site.plat||[];
 PL.push([F.x0,F.n0,F.x1,F.top,-D]);
 // retaining walls W, E, S (top flush with 0) + coping + railing
 const rw=(x0,x1,n0,n1)=>{box(conc,x0,x1,-D,0,n0,n1);box(coping,x0-0.05,x1+0.05,0,0.12,n0-0.05,n1+0.05);WALLS.site.r.push([x0,n0,x1,n1]);};
 rw(F.x0-0.3,F.x0,F.n0-0.3,F.n1);rw(F.x1,F.x1+0.3,F.n0-0.3,F.n1);rw(F.x0-0.3,F.x1+0.3,F.n0-0.3,F.n0);
 const rl=(x0,x1,n0,n1)=>{const L=Math.max(x1-x0,n1-n0),ax=x1-x0>n1-n0;for(const y of[1.05,0.55])box(rail,x0,x1,y,y+0.05,n0,n1);for(let t=0;t<=L;t+=2.0){const x=ax?x0+t:x0,n=ax?n0:n0+t;box(rail,x-0.03,x+0.03+(ax?0:x1-x0),0.12,1.1,n-0.03,n+0.03);}};
 rl(F.x0-0.2,F.x0-0.1,F.n0-0.2,F.top);rl(F.x1+0.1,F.x1+0.2,F.n0-0.2,F.top);rl(F.x0-0.2,F.x1+0.2,F.n0-0.2,F.n0-0.1);
 // north band (n top..n1): tiers. stands under the striped canopies, 구령대 block in the middle, concrete steps elsewhere
 const STANDS=[[-24,-6.2],[7.2,26]],POD=[-4.6,5.7];const depth=F.n1-F.top;
 const tiersAt=(x0,x1,k,rise,mat,nose)=>{const t=depth/k;for(let i=0;i<k;i++){const y=-D+rise*(i+1),na=F.top+i*t,nb=na+t;const top=i===k-1?0:y;
   box(mat,x0,x1,-D,top,na,nb);if(nose)box(nose,x0,x1,top-0.04,top+0.004,na,na+0.05);PL.push([x0,na,x1,nb,top]);}};
 const segs=[];let x=F.x0;const cuts=[...STANDS.map(s=>[...s,'w']),[...POD,'p']].sort((a,b)=>a[0]-b[0]);for(const[a,b,t]of cuts){if(a>x)segs.push([x,a,'c']);segs.push([a,b,t]);x=b;}if(x<F.x1)segs.push([x,F.x1,'c']);
 for(const[a,b,t]of segs){if(t==='w')tiersAt(a,b,6,D/6,wood,woodR);else if(t==='c')tiersAt(a,b,18,D/18,conc,coping);
  else{box(white,a,b,-D,0,F.top,F.n1);const m=(a+b)/2;box(door,m-0.55,m+0.55,-D,-D+2.0,F.top-0.03,F.top);box(white,m-0.7,m+0.7,-D+2.0,-D+2.15,F.top-0.06,F.top);}}
 // stand side cheek walls so the tier ends are clean
 for(const[a,b]of STANDS)for(const xx of[a,b])box(white,xx-0.08,xx+0.08,-D,0.15,F.top,F.n1);
 // extend the canopy posts down to the field
 for(const[x0,x1]of STANDS){const len=x1-x0;for(let xx=x0;xx<=x1+0.01;xx+=len/Math.round(len/5))for(const n of[-14.4,-18.4]){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,D,8),post);p.position.set(xx,-D/2,-n);g.add(p);}}
 // 정문 진입로 (photos 125,208,345,323): green-coated walkway from the 정문 along the 정보관 side, flower-bed strip on its field side
 {const gm=S({color:0x3f8f5a,roughness:0.7}),bed=S({color:0x6b4a32,roughness:0.9}),shrub=S({color:0x4f8a3c,roughness:0.9});const A=[-60.5,-82.5],Bp=[-50.5,-24];const dx=Bp[0]-A[0],dn=Bp[1]-A[1],L=Math.hypot(dx,dn),ang=Math.atan2(dx,dn);
  const strip=(off,w,h,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,L),m);b.position.set((A[0]+Bp[0])/2+Math.cos(ang)*off,h/2,-((A[1]+Bp[1])/2-Math.sin(ang)*off));b.rotation.y=ang;b.receiveShadow=true;g.add(b);return b;};
  strip(0,3.2,0.02,gm);strip(2.1,0.9,0.28,bed);for(let t=0.05;t<1;t+=0.06){const sh=new THREE.Mesh(new THREE.SphereGeometry(0.42,8,6),shrub);sh.scale.y=0.7;sh.position.set(A[0]+dx*t+Math.cos(ang)*2.1,0.5,-(A[1]+dn*t-Math.sin(ang)*2.1));g.add(sh);}}
 c.group.add(g);}
