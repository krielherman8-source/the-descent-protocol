#!/bin/bash
# full test suite: builds each harness page and runs it headless; output -> /tmp/suite/<name>.txt
cd /tmp/h; mkdir -p /tmp/suite
for t in sm ui st ex perf gw; do python3 mk.py $t.js $t.html; ./run.sh "$t.html" 600000 > /tmp/suite/$t.txt 2>&1; done
python3 mk.py hc.js hc.html; ./run.sh "hc.html#f=0,7,19,24,29" 600000 > /tmp/suite/hc.txt 2>&1
echo DONE > /tmp/suite/done
