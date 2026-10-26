import sys
s=open('/workspace/descent/index.html').read()
c='<script>window.ERRS=[];window.onerror=(m,src,l)=>{ERRS.push(m+" @"+l)};addEventListener("unhandledrejection",e=>ERRS.push("rej "+e.reason))</script>'
s=s.replace('<script type="module">',c+'<script type="module">',1)
h=open(sys.argv[1]).read()
s=s.replace('</body>','<script>\n'+h+'\n</script></body>')
open('/tmp/srv/'+sys.argv[2],'w').write(s)
