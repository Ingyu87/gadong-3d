# drone: passes through walls into a classroom, clamps to [-2.3, 60], exits cleanly to walk
import sys
from playwright.sync_api import sync_playwright
U=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:18741/'
ok=True
with sync_playwright() as p:
  b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader']);pg=b.new_page(viewport={'width':800,'height':500})
  errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto(U+'index.html?ao=0');pg.wait_for_function('window.__loaded',timeout=300000);pg.wait_for_timeout(1500)
  pg.evaluate('window.__noBob=1;window.__noLock=1');pg.click('#dronebtn');pg.wait_for_timeout(300)
  c=pg.evaluate("document.body.className");ok&='drone' in c
  pg.evaluate("__api.cam.position.set(33.8,5.3,20)");r=pg.evaluate("__simTo(33.8,13.5,400)");t=r['d']<0.5;print('through wall',t);ok&=t
  pg.evaluate("__api.cam.position.set(0.5,-10,40)");pg.evaluate("__simTo(0.5,39,5)");lo=pg.evaluate("__api.cam.position.y");print('lo',lo);ok&=abs(lo+2.3)<0.01
  pg.evaluate("__api.cam.position.set(0.5,99,40)");pg.evaluate("__simTo(0.5,39,5)");hi=pg.evaluate("__api.cam.position.y");print('hi',hi);ok&=hi<=60.001
  pg.click('#walkbtn');pg.wait_for_timeout(500);c=pg.evaluate("document.body.className");y=pg.evaluate("__api.cam.position.y");t='drone' not in c and abs(y+1.1)<0.05;print('walk after',c,y,t);ok&=t
  ok&=not errs;print('errs',errs);b.close()
print('DRONE PASS' if ok else 'DRONE FAIL')
