# eye-height test: in walk mode, tap-go to many screen points and walk to many spots; FAIL if eye > walkable surface + EYE + 0.5
import sys,json
from playwright.sync_api import sync_playwright
U=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:18741/'
SPOTS=[(0.5,-40,0),(10,-60,0),(-30,-29.5,0),(-40,-29.5,0),(-46,-29.5,0),(66.5,-20,0),(66.5,20,0),(62,39.5,0),(48,-16,0),(44,-24,0),(30,-5,0),(0,5,0),(-20,-14,0),(60,-50,0)]
with sync_playwright() as p:
  b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader']);pg=b.new_page(viewport={'width':800,'height':500})
  pg.goto(U+'index.html?ao=0');pg.wait_for_function('window.__loaded',timeout=300000);pg.wait_for_timeout(1500)
  pg.evaluate('window.__noBob=1;window.__noLock=1;__spawn()')
  chk="(()=>{const c=__api.cam.position,f=c.y-1.6;const s=__surface(c.x,-c.z,f-0.42);const none=Math.abs(s-(f-0.42))<1e-6;return [c.x,c.y,-c.z,s,none?99:f-s];})()"
  bad=[];worst=0
  def look(tag):
    global worst
    r=pg.evaluate(chk)
    # surfaceAt returns feet itself when nothing is found: treat that as floating, re-query from far above ground
    air=r[4]
    worst=max(worst,air)
    if air>0.5:bad.append((tag,[round(v,2) for v in r],round(air,2)))
  for i,(x,n,_) in enumerate(SPOTS):
    pg.evaluate("__spawn()");pg.evaluate(f"__simTo({x},{n},900)");pg.wait_for_timeout(200);look(f'walk{i}')
    for (px,py) in [(400,200),(250,150),(550,150),(400,100),(150,250),(650,250),(400,60)]:
      pg.evaluate(f"__goAt({px},{py})");pg.wait_for_timeout(900);look(f'tap{i}@{px},{py}')
  # walk off a 0-level edge into the lowered field / LOW strips: must fall to the pit floor
  for i,(x,n) in enumerate([(0.5,-40),(20,-70),(-40,-35),(60,-80),(0,-100)]):
    pg.evaluate(f"__api.setWalk(true,[{x},1.6,{-n}],0)");pg.evaluate(f"__simTo({x},{n-3},120)");look(f'drop{i}')
  print('WORST',round(worst,2));[print('AIR',*x) for x in bad[:20]]
  print('EYE PASS' if not bad else 'EYE FAIL')
  b.close()
