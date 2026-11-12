import os, sys
here=os.path.dirname(os.path.abspath(__file__))
cands=[os.path.join(os.path.dirname(here),'index.html'),'/workspace/descent/index.html']
src=next(p for p in cands if os.path.isfile(p))
s=open(src).read()
c='<script>window.ERRS=[];window.onerror=(m,src,l)=>{ERRS.push(m+" @"+l)};addEventListener("unhandledrejection",e=>ERRS.push("rej "+e.reason))</script>'
s=s.replace('<script type="module">',c+'<script type="module">',1)
h=open(sys.argv[1]).read()
s=s.replace('</body>','<script>\n'+h+'\n</script></body>')
open('/tmp/srv/'+sys.argv[2],'w').write(s)
