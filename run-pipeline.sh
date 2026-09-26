#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

LOG="pipeline.log"

{
  echo "========================================================================"
  echo " PIPELINE LOG — un-mejor-sistema-num-rico"
  echo "========================================================================"
  echo "Timestamp (UTC): $(date -u '+%Y-%m-%d %H:%M:%S')"
  echo "Timestamp (ISO): $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "----------------------------------------"
  echo "Deno: $(deno --version | tr '\n' ' ')"
  echo "----------------------------------------"
  echo "Git revision: $(git rev-parse HEAD 2>/dev/null || echo 'n/a')"
  echo "Git branch:   $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'n/a')"
  echo "----------------------------------------"
  echo "Workspace files:"
  ls -la
  echo "========================================================================"
  echo
} > "$LOG"

echo "==================================================" >> "$LOG"
echo " STEP 1 — Type-check (deno check)" >> "$LOG"
echo "==================================================" >> "$LOG"
deno check index.ts >> "$LOG" 2>&1
echo "  -> deno check passed" >> "$LOG"
echo >> "$LOG"

echo "==================================================" >> "$LOG"
echo " STEP 2 — Run tests (deno test, debug log level)" >> "$LOG"
echo "==================================================" >> "$LOG"
deno test --allow-all --log-level debug index_test.ts >> "$LOG" 2>&1
echo >> "$LOG"

echo "==================================================" >> "$LOG"
echo " STEP 3 — Generate prefix table for levels 1..500" >> "$LOG"
echo "==================================================" >> "$LOG"
deno eval '
import { generarPrefijoLatino } from "./index.ts";
for (let i = 1; i <= 500; i++) {
  const p = generarPrefijoLatino(i);
  const ceros = 6n * (2n ** BigInt(i - 1));
  console.log(`nivel ${i} -> prefijo "${p}" -> "${p}illón" = 10^${ceros}`);
}
' >> "$LOG" 2>&1
echo >> "$LOG"

echo "==================================================" >> "$LOG"
echo " STEP 4 — Cascade: translate progressively larger numbers" >> "$LOG"
echo "==================================================" >> "$LOG"
deno eval '
import traducir from "./index.ts";
for (let n = 1; n <= 12; n++) {
  const zeros = 6n * (2n ** BigInt(n - 1));
  const big = 10n ** zeros;
  console.log(`10^${zeros} -> ${traducir(big)}`);
}
for (let n = 1; n <= 10; n++) {
  const zeros = 6n * (2n ** BigInt(n - 1));
  const big = 9n * (10n ** zeros);
  console.log(`9 x 10^${zeros} -> ${traducir(big)}`);
}
' >> "$LOG" 2>&1
echo >> "$LOG"

echo "==================================================" >> "$LOG"
echo " STEP 5 — Mixed-number stress (random bigints)" >> "$LOG"
echo "==================================================" >> "$LOG"
deno eval '
import traducir from "./index.ts";
const primes = [
  89n, 271n, 4513n, 18679n, 134669n, 3626149n, 88012289n, 612483331n,
  3229045081n, 10203980217n, 1416509394347n, 36673500363213n,
];
for (let i = 0; i < 200; i++) {
  let acc = 0n;
  for (let j = 0; j < primes.length; j++) {
    acc = acc * 10n ** 3n + primes[(i + j) % primes.length];
  }
  console.log(`${acc.toString().slice(0, 40)}... -> ${traducir(acc).slice(0, 180)}`);
}
' >> "$LOG" 2>&1
echo >> "$LOG"

echo "==================================================" >> "$LOG"
echo " STEP 6 — Source under test (index.ts)" >> "$LOG"
echo "==================================================" >> "$LOG"
cat index.ts >> "$LOG"
echo >> "$LOG"

echo "==================================================" >> "$LOG"
echo " STEP 7 — Test definitions (index_test.ts)" >> "$LOG"
echo "==================================================" >> "$LOG"
cat index_test.ts >> "$LOG"
echo >> "$LOG"

echo "==================================================" >> "$LOG"
echo " PIPELINE COMPLETE" >> "$LOG"
echo "==================================================" >> "$LOG"
echo "End (UTC): $(date -u '+%Y-%m-%d %H:%M:%S')" >> "$LOG"

SIZE=$(wc -c < "$LOG")
LINES=$(wc -l < "$LOG")
echo "-> $LOG écrit : $LINES lignes, $SIZE octets"