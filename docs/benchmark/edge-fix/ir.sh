#!/bin/bash
# ./ir.sh <name> <app> <scenario> <W> <K>  ->  "<name> <app> <scenario> <K> <instructions>"
# A young generation of 1 GB: no GC runs, so this counts the framework's own
# instructions. The same bundle gives the same count every run.
cd "$(dirname "$0")"
n=$(valgrind --tool=callgrind --callgrind-out-file=/dev/null --smc-check=all \
  node --predictable --single-threaded --min-semi-space-size=1024 --max-semi-space-size=1024 \
  micro.mjs "$@" 2>&1 | grep -oE "Collected : [0-9]+" | grep -oE "[0-9]+")
echo "$1 $2 $3 $5 $n"
