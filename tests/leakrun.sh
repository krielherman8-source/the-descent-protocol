#!/bin/bash
# usage: tests/leakrun.sh TAG  -> /tmp/leak/TAG_full.txt (30-floor Normal run) and /tmp/leak/TAG_cycle.txt
# (death->Restart, death->title->Continue, pause->Save&Quit->Start, x6), then a summary table via leaksum.py.
# ENDLESS=1 adds /tmp/leak/TAG_endless.txt (15 Endless floors from the title + Continue); ONLY_ENDLESS=1 ENDLESS=1 runs just that.
# Real-time CDP run (not virtual time); takes several minutes, so run it in the background.
cd "$(dirname "$0")/.."; mkdir -p /tmp/leak /tmp/pw
[ -z "$ONLY_ENDLESS" ] && node --experimental-websocket tests/leak.mjs 'leak.html#sc=full&diff=normal&cap=300&deaths=3' /tmp/leak/$1_full.txt 40 &
[ -n "$ENDLESS" ] && node --experimental-websocket tests/leak.mjs 'leak.html#sc=endless&diff=normal&cap=300&deaths=3&floors=15' /tmp/leak/$1_endless.txt 60 &
[ -z "$ONLY_ENDLESS" ] && node --experimental-websocket tests/leak.mjs 'leak.html#sc=cycle&diff=normal&cap=200&deaths=3&cycles=6' /tmp/leak/$1_cycle.txt 40 &
wait; python3 tests/leaksum.py $(ls /tmp/leak/$1_full.txt /tmp/leak/$1_cycle.txt /tmp/leak/$1_endless.txt 2>/dev/null) > /tmp/leak/$1_summary.txt; echo DONE >> /tmp/leak/$1_summary.txt
