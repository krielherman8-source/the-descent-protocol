#!/bin/bash
# full test suite: builds each harness page and runs it headless; output -> /tmp/suite/<name>.txt
cd "$(dirname "$0")"
mkdir -p /tmp/suite /tmp/srv
for d in js css vendor; do
  if [[ -L /tmp/srv/$d || -e /tmp/srv/$d ]]; then rm -rf /tmp/srv/$d; fi
  ln -s "$PWD/../$d" /tmp/srv/$d
done
for t in sm ui st ex perf gw tc mob; do python3 mk.py "$t.js" "$t.html"; ./run.sh "$t.html" 600000 > /tmp/suite/$t.txt 2>&1; done
python3 mk.py hc.js hc.html; ./run.sh "hc.html#f=0,7,19,24,29" 600000 > /tmp/suite/hc.txt 2>&1
echo DONE > /tmp/suite/done
