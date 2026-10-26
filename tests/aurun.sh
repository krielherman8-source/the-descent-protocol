#!/bin/bash
# usage: aurun.sh outfile
cd /tmp/pw; : > $1
for d in 0 1; do for sc in menu combat boss; do pkill -f "remote-debugging-port=9333"; sleep 1; TMAX=300000 timeout 330 node --experimental-websocket cdp2.mjs "au.html#scene=$sc&duck=$d&dur=12" >> $1 2>&1; done; done
pkill -f "remote-debugging-port=9333"; echo DONE >> $1
