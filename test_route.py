import sys,math,time,os,json
from playwright.sync_api import sync_playwright
U=sys.argv[1];O='/workspace/cad/final-shots/route/';os.makedirs(O,exist_ok=True)
ROUTES={
 'main_to_rosehall':(3.6,[(-48.75,4.0),(-48.75,-3.5),(-48.75,-8.6),(-48.75,-10.8),(-49.2,-12.5)]),
 'music_2F':(3.6,[(-48.75,6.0),(-48.75,3.2),(-49.6,3.2),(-51.2,3.2),(-53.0,3.2),(-52.0,3.2)]),
 'B1_down':(0,[(6.0,24.2),(4.6,24.2),(0.4,24.2),(-0.6,24.2),(-0.6,26.45),(0.4,26.45),(4.4,26.45),(5.6,24.0),(2.6,21.0),(2.6,17.5),(1.0,16.5)]),
 'H2_gym':(0,[(66.8,-11.5),(66.8,-12.7),(66.8,-18.6),(66.5,-20.4),(65.0,-20.4),(63.5,-21.5),(60,-25)]),
 'S2_up':(0,[(5.0,26.4),(0.4,26.4),(-0.6,26.4),(-0.6,24.2),(0.4,24.2),(4.6,24.2)]),
 'door_S1_3F':(7.2,[(-44.4,22.0),(-44.4,19.6),(-44.4,18.4)]),'door_S3_3F':(7.2,[(49.0,22.0),(49.0,19.6)]),'door_S2_3F':(7.2,[(5.5,21.8),(5.5,24.2)]),'door_S2_2F':(3.6,[(2.9,21.8),(2.9,23.6)]),'door_info_1F':(0,[(-45.0,-15.4),(-42.6,-15.4)]),
 'play_block':(0,[(-40,-65.0),(-46.5,-65.0)]),
 'rose_walkway':(0,[(-38.0,-20.1),(-41.7,-20.1),(-41.9,-29.4),(-45.2,-29.4)]),
 'rose_in_out':(0,[(-46.5,-29.4),(-41.5,-29.4)]),
 'info_lobby_out':(0,[(-48.75,-10.8),(-46.0,-10.9),(-43.0,-10.9),(-43.0,-16.3),(-41.6,-16.5),(-41.6,-18.5)]),
 'info_up':(0,[(-48.75,-10.8),(-46.0,-10.9),(-43.0,-10.9),(-43.0,-16.3),(-41.0,-16.4),(-41.0,-15.6),(-41.0,-11.0),(-41.0,-9.9)]),
 'gyomu_corr':(0,[(4.45,14.0),(4.45,21.6),(-6.6,21.6),(-15.0,21.6),(-28.0,21.6),(-33.0,21.6)]),
 'hall_entrance':(-2.7,[(39.0,-35.7),(44.0,-35.7),(47.0,-35.7),(52.0,-37.0)]),
 'to_dining':(-2.7,[(40,-44.6),(44.0,-44.6),(46.0,-44.5),(48.6,-44.5),(48.5,-48.5)]),
 'p60_stair':(-2.7,[(42.8,-30.0),(42.8,-27.0),(42.8,-23.0),(42.8,-19.9),(42.8,-17.5)]),
 'back_dining':(0,[(66.5,-11.5),(66.5,-30),(66.5,-39.5),(66.5,-47.6),(66.3,-54.05),(64.9,-54.05),(64.65,-53.0),(64.65,-50)]),
 'mural_down':(0,[(46.1,-52.0),(46.1,-51.3),(46.1,-46.0),(46.0,-44.5),(43.5,-44.6),(40,-44.6)]),
 'to_gym_mural':(-2.7,[(40,-44.6),(44.0,-44.6),(46.0,-44.6),(46.1,-46.0),(46.1,-51.3),(46.1,-51.8),(48.5,-51.9),(52,-45)]),
 'to_gym':(-2.7,[(39,-35.7),(43,-35.7),(46.2,-35.7),(46.2,-30),(46.3,-19.2),(46.3,-13.3),(46.3,-12.6)]),
 'to_dining_west':(-2.7,[(37,-35.7),(43,-35.7),(46.2,-35.7),(52,-36.2),(56.5,-36.5),(57.5,-37.4),(55.0,-37.4)]),
 'podium_top':(0,[(4.5,8.0),(4.0,5.5),(2.5,-8.0),(0.55,-11.6),(0.55,-15.5)]),
 'podium_jump':(0,[(-1.5,-9.0),(-1.5,-11.9),(-1.5,-15.0)]),
 'field_steps':(0,[(-30,-10.5),(-30,-12.0),(-30,-19.5),(-20,-35),(-30,-25),(-30,-19.0),(-30,-11.0)]),
 'field_stands':(0,[(-13,-10.5),(-13,-12.0),(-13,-19.5),(-10,-30)]),
 'S3_1F_north':(0,[(51.1,21.5),(51.1,19.4),(51.1,17.6),(51.1,14.3),(48.8,14.3),(48.8,15.3),(48.8,18.0)]),
 'S3_1F':(0,[(48.8,12.0),(48.8,14.0),(48.8,18.25),(51.1,18.25),(51.1,17.8),(51.1,14.3),(48.8,14.3),(48.8,15.3),(48.8,19.6)]),
}
sel=sys.argv[2].split(',') if len(sys.argv)>2 else list(ROUTES)
with sync_playwright() as p:
  b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader']);pg=b.new_page(viewport={'width':800,'height':500});er=[];pg.on('pageerror',lambda e:er.append(str(e)))
  pg.goto(U+'index.html?ao=0');pg.wait_for_function('window.__loaded',timeout=600000);pg.wait_for_timeout(2000);pg.evaluate('window.__noBob=1;window.__noLock=1')
  for name in sel:
    e,pts=ROUTES[name]
    if pts[0] is None:
      pg.evaluate("__api.setWalk(false)");pg.click('#walkbtn');pg.wait_for_timeout(1500);w=pg.evaluate('__walkState().pos');print('  spawn',round(w[0],2),round(-w[2],2),flush=True)
    else:
      x,n=pts[0];pg.evaluate(f"__api.setWalk(true,[{x},{e+1.6},{-n}],0)");pg.wait_for_timeout(700)
    if name=='podium_jump':pg.evaluate('window.__noStepUp=1')
    ok=True;pg.keyboard.down('KeyW')
    for i,(tx,tn) in enumerate(pts[1:]):
      best=1e9;T=time.time();tl=T;pressed=False
      while time.time()-T<90:
        w=pg.evaluate('__walkState().pos');cx,cn=w[0],-w[2];d=math.hypot(tx-cx,tn-cn)
        if d<0.45:break
        pg.evaluate(f"__setYaw({math.atan2(-(tx-cx),(tn-cn))})")
        if d<best-0.05:best=d;tl=time.time()
        if name=='podium_jump' and i==1 and d<2.75 and not pressed:
          pressed=True;pg.keyboard.press('Space');print('  jump at',round(cx,2),round(cn,2),flush=True)
        if time.time()-tl>5 and not pressed:
          pressed=True;tl=time.time();print('  pressed E at',round(cx,2),round(cn,2),flush=True)
        if time.time()-tl>8:ok=False;break
        pg.wait_for_timeout(80)
      print(f'  wp{i+1} {(tx,tn)} {"ok" if ok else "STUCK"} at {cx:.2f},{cn:.2f} eye {w[1]:.2f}',flush=True)
      if not ok:break
    pg.keyboard.up('KeyW');pg.wait_for_timeout(800)
    if name.startswith('podium'):
      w=pg.evaluate('__walkState().pos');top=w[1]>1.6+0.45-0.06;print('  on podium top:',top,'eye',round(w[1],2),flush=True);ok=ok and top
    pg.evaluate('window.__noStepUp=0')
    if name=='music_2F':pg.evaluate('__setYaw(-Math.PI/2)');pg.wait_for_timeout(1500);print('  door vis',[d for d in pg.evaluate('__doors()') if d['c']=='main_2F' and d['x0']<-49.9 and 2<d['n0']<4])
    pg.screenshot(path=O+name+('.png' if ok else '_FAIL.png'),timeout=200000)
    print(('PASS ' if ok else 'FAIL ')+name,flush=True)
  print('errs',er)
