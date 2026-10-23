import sys,json
from playwright.sync_api import sync_playwright
U=sys.argv[1];ok=True
with sync_playwright() as p:
  b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']);pg=b.new_page(viewport={'width':1000,'height':700})
  pg.goto(U+'index.html?ao=0');pg.wait_for_function('window.__loaded',timeout=300000);pg.wait_for_timeout(1500);pg.evaluate('window.__noLock=1')
  s=pg.evaluate('__api.cam.position.toArray()');sp=abs(s[0]-0.5)<0.6 and abs(s[1]-(-1.1))<0.3 and abs(s[2]-40)<0.6;print('spawn',[round(v,2) for v in s],'PASS' if sp else 'FAIL');ok&=sp
  pg.evaluate("__goAt(500,600)");pg.wait_for_timeout(1500);a0=pg.evaluate('__api.cam.position.toArray()');lk=abs(a0[2]-40)<0.05 and 'mvon' not in pg.get_attribute('#mv','class');print('look-mode tap no move',[round(v,2) for v in a0],'PASS' if lk else 'FAIL');ok&=lk
  pg.click('#mv');pg.wait_for_timeout(300);print('badge',pg.inner_text('#mode'));ok&=('이동' in pg.inner_text('#mode'))
  pg.evaluate("__goAt(500,600)");pg.wait_for_timeout(2500);a=pg.evaluate('__api.cam.position.toArray()');t=pg.evaluate('window.__lastGo')
  g=t is not None and abs(a[0]-t[0])<0.6 and abs(-a[2]-t[2])<0.6 and abs(a[1]-1.6-t[1])<0.3;print('walk tap',t,[round(v,2) for v in a],'PASS' if g else 'FAIL');ok&=g
  # sky view: click -> popup -> go
  pg.click('#home');pg.wait_for_timeout(2500);pg.evaluate("window.__lastGo=null");pg.evaluate("__goAt(560,430)");pg.wait_for_timeout(300)
  vis=pg.evaluate("getComputedStyle(document.getElementById('goto')).display");pg.screenshot(path='/workspace/cad/final-shots/ui/tapgo_popup.png')
  if vis=='block':pg.click('#goto button');pg.wait_for_timeout(1500)
  w=pg.evaluate("document.body.classList.contains('walk')");print('sky go',vis,w,'PASS' if vis=='block' and w else 'FAIL');ok&=(vis=='block' and w)
  pg.screenshot(path='/workspace/cad/final-shots/ui/tapgo_after.png')
print('ALL','PASS' if ok else 'FAIL')
