import sys,math
from playwright.sync_api import sync_playwright
U=sys.argv[1];ok=True
def chk(c,m):
  global ok;ok&=bool(c);print(('PASS ' if c else 'FAIL ')+m)
W=lambda pg:pg.evaluate("__walkState()")
with sync_playwright() as p:
  b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader']);pg=b.new_page(viewport={'width':1280,'height':800});er=[];pg.on('pageerror',lambda e:er.append(str(e)))
  pg.goto(U+'index.html?ao=0');pg.wait_for_function('window.__loaded',timeout=600000);pg.wait_for_timeout(2500)
  w=W(pg);chk(w['walk'] and abs(-w['pos'][2]+40)<3 and abs(w['pos'][1]+1.1)<0.4,f"spawn FPS on the field {w['pos']}")
  chk(pg.evaluate("getComputedStyle(document.getElementById('xh')).display")=='block','crosshair visible')
  pg.screenshot(path='/workspace/cad/final-shots/fps_spawn.png',timeout=200000)
  y0=W(pg)['yaw'];pg.evaluate("__look(200,0)");chk(W(pg)['yaw']<y0-0.2,'mouse-look (pointer-lock movement) turns right')
  pg.evaluate("__look(-200,0)")
  p0=W(pg)['pos'];pg.keyboard.down('KeyW');pg.wait_for_timeout(3000);pg.keyboard.up('KeyW');p1=W(pg)['pos'];chk(-p1[2]>-p0[2]+1,f'W moves forward {p0[2]:.2f}->{p1[2]:.2f}')
  pg.evaluate('window.__jumpMax=0');pg.keyboard.press('Space');hs=[]
  for i in range(60):
    pg.wait_for_timeout(400);hs.append(W(pg)['pos'][1])
    if i>3 and abs(hs[-1]-p1[1])<0.02 and pg.evaluate('window.__jumpMax')>0:break
  h=p1[1]+pg.evaluate('window.__jumpMax');h2=hs[-1];chk(h>p1[1]+0.15 and abs(h2-p1[1])<0.05,f'jump up {h:.2f} and land {h2:.2f}')
  pg.click('#home');pg.wait_for_timeout(1500);chk(not W(pg)['walk'],'조감 leaves FPS');chk(pg.is_visible('#back'),'돌아가기 shown')
  pg.click('#back');pg.wait_for_timeout(1500);w=W(pg);chk(w['walk'] and math.dist(w['pos'],p1)<1.5,'돌아가기 returns to last FPS position')
  print('desk errs',er)
  ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True);m=ctx.new_page();me=[];m.on('pageerror',lambda e:me.append(str(e)))
  m.goto(U+'index.html');m.wait_for_function('window.__loaded',timeout=600000);m.wait_for_timeout(2500);cdp=ctx.new_cdp_session(m)
  def drag(pts,hold=0):
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':pts[0][0],'y':pts[0][1]}]})
    for x,y in pts[1:]:cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y}]});m.wait_for_timeout(16)
    if hold:m.wait_for_timeout(hold)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});m.wait_for_timeout(500)
  u0=W(m);chk(u0['walk'],'mobile starts in FPS')
  bx=m.evaluate("(()=>{const b=document.getElementById('joy').getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()")
  drag([(bx[0],bx[1]-i*4) for i in range(12)],hold=2500);u1=W(m);chk(math.dist(u1['pos'],u0['pos'])>1,f'joystick moves {math.dist(u1["pos"],u0["pos"]):.2f} m')
  drag([(300-i*8,400) for i in range(14)]);u2=W(m);chk(abs(u2['yaw']-u1['yaw'])>0.2,'right-half drag looks')
  m.tap('#pJump');mh=[]
  for i in range(12):
    m.wait_for_timeout(150);mh.append(W(m)['pos'][1])
  chk(max(mh)>u2['pos'][1]+0.1,f'jump button (peak {max(mh)-u2["pos"][1]:.2f} m)')
  m.screenshot(path='/workspace/cad/final-shots/fps_mobile.png',timeout=200000);print('mob errs',me)
  b.close()
print('ALL OK' if ok and not er and not me else 'SOME FAIL')
