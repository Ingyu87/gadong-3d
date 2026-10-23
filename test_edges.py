# walks from the sunk field outwards across every edge; FAIL if the walker ever stands outside the field/apron below ground (eye < 1.0 where ground is 0)
import sys,math,time
from playwright.sync_api import sync_playwright
U=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:18741/'
F=dict(x0=-37,x1=45,n0=-90,n1=-12.5)
HALL=[(45.0,65.6,-60.4,-9.6),(41.6,45.1,-19.5,-9.6)]
def low_ok(x,n):
  if F['x0']-0.4<x<F['x1']+0.4 and F['n0']-0.4<n<F['n1']+0.4:return True
  return any(a<=x<=b and c<=n<=d for a,b,c,d in HALL)
T=[('W',(-30,-50),(-45,-50)),('W2',(-30,-80),(-45,-80)),('S',(0,-80),(0,-100)),('S2',(30,-85),(30,-100)),('SE',(38,-75),(55,-75)),('E_hall',(38,-30),(52,-30)),('E_mural',(38,-50),(52,-50)),('NE',(40,-24),(40,-5)),('N',(15,-30),(15,-5)),('NW',(-34,-24),(-40,-5)),('N_steps',(-30,-24),(-30,-5)),('SW',(-34,-87),(-42,-95))]
bad=0
with sync_playwright() as p:
  b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader']);pg=b.new_page(viewport={'width':640,'height':400})
  pg.goto(U+'index.html?ao=0');pg.wait_for_function('window.__loaded',timeout=600000);pg.wait_for_timeout(1500);pg.evaluate('window.__noBob=1;window.__noLock=1')
  for name,(sx,sn),(tx,tn) in [t for t in T if len(sys.argv)<3 or t[0] in sys.argv[2].split(',')]:
    pg.evaluate(f"__api.setWalk(true,[{sx},{-2.7+1.6},{-sn}],0)");pg.wait_for_timeout(500);pg.keyboard.down('KeyW');T0=time.time();worst=None;mx=0
    while time.time()-T0<14:
      w=pg.evaluate('__walkState().pos');cx,cn,ey=w[0],-w[2],w[1]
      pg.evaluate(f"__setYaw({math.atan2(-(tx-cx),(tn-cn))})")
      if not low_ok(cx,cn) and ey<1.0: worst=(round(cx,2),round(cn,2),round(ey,2))
      if math.hypot(tx-cx,tn-cn)<0.5:break
      pg.wait_for_timeout(100)
    pg.keyboard.up('KeyW');ok=worst is None;bad+=not ok
    print(('PASS ' if ok else 'FAIL ')+name,'end',round(cx,2),round(cn,2),'eye',round(ey,2),'underground at' if worst else '',worst or '',flush=True)
import sys as _s
sel=None
print('EDGE', 'PASS' if bad==0 else f'FAIL {bad}')
