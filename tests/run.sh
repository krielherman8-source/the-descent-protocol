#!/bin/bash
# run.sh page.html#hash [budget]
pgrep -f "http.server 8765" >/dev/null || (cd /tmp/srv && setsid nohup python3 -m http.server 8765 >/tmp/http.log 2>&1 &) ; sleep 0.5
timeout 2400 google-chrome --headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader --autoplay-policy=no-user-gesture-required --window-size=1280,800 --virtual-time-budget=${2:-3000} --dump-dom "http://localhost:8765/$1" 2>/dev/null | python3 -c "
import re,html,sys;s=sys.stdin.read();m=re.search(r'<body[^>]*data-log=\"([^\"]*)\"',s);print(html.unescape(m.group(1)) if m else 'NOLOG')"
