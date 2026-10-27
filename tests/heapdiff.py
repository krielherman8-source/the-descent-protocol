# usage: python3 tests/heapdiff.py a.heapsnapshot b.heapsnapshot  -> object count/size growth by constructor (top 25)
import json,sys,collections
def agg(p):
    d=json.load(open(p));m=d['snapshot']['meta'];nf=m['node_fields'];N=len(nf);types=m['node_types'][0];S=d['strings'];n=d['nodes']
    ti,ni,si=nf.index('type'),nf.index('name'),nf.index('self_size');c=collections.Counter();z=collections.Counter()
    for i in range(0,len(n),N):
        t=types[n[i+ti]];k=t+':'+(S[n[i+ni]][:60] if t in('object','closure','native','array','hidden') else '')
        c[k]+=1;z[k]+=n[i+si]
    return c,z
(a,az),(b,bz)=agg(sys.argv[1]),agg(sys.argv[2])
rows=sorted(set(a)|set(b),key=lambda k:-(bz[k]-az[k]))
print('total bytes',sum(az.values()),'->',sum(bz.values()))
for k in rows[:25]: print(f'{bz[k]-az[k]:>9} B {b[k]-a[k]:>7} n  {k}')
