# usage: python3 tests/leaksum.py full.txt [cycle.txt]  -> compact per-floor / per-step tables
import json,sys
def rows(p):
    R=[];tail=[]
    for l in open(p):
        (R.append(json.loads(l)) if l.startswith('{') else tail.append(l.strip()))
    return R,tail
cols=[('tag',16),('floor',3),('geo',5),('tex',4),('heapMB',7),('calls',5),('sceneObjs',6),('sceneChildren',5),('lights',4),('lightsOn',4),('pooled',5),('enemies',4),('bullets',4),('parts',5),('decals',4),('gibs',4),('audioLive',6),('audioPlaying',5),('listeners',5),('intervals',3),('timeouts',3),('rafPerFrameMax',3)]
hdr={'sceneObjs':'objs','sceneChildren':'kids','lightsOn':'litOn','audioLive':'auLive','audioPlaying':'auPly','listeners':'lstn','intervals':'iv','timeouts':'to','rafPerFrameMax':'raf','enemies':'en','bullets':'bul','parts':'part','decals':'dec','heapMB':'heapMB'}
for p in sys.argv[1:]:
    R,tail=rows(p);print('==',p)
    print(' '.join(hdr.get(c,c)[:w].rjust(w) for c,w in cols))
    for r in R: print(' '.join(str(r.get(c,'')).rjust(w)[:max(w,len(str(r.get(c,''))))] for c,w in cols))
    for t in tail: print(t)
