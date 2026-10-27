#!/bin/bash
# usage: botrun.sh tag  -> /tmp/bot_<tag>_<diff>.txt, one run per invocation so partial results survive
cd /tmp/h; python3 mk.py bot.js bot.html
for r in 1 2; do for d in easy normal hard; do ./run.sh "bot.html#runs=1&diff=$d&deaths=3&r=$r" 2400000 > /tmp/bot_$1_${d}_$r.txt 2>&1; done; done
echo DONE > /tmp/bot_$1_done
