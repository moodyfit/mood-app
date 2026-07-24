#!/usr/bin/env bash
# 낱장 HTML(render/*.html) → 인스타 4:5 PNG(1080x1350). Chrome headless. manifest.json 기준.
set -euo pipefail
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || { echo "Chrome 없음: $CHROME"; exit 1; }

node -e '
const {readFileSync}=require("fs");
for(const x of JSON.parse(readFileSync("manifest.json","utf8"))) console.log(x.render+"|"+x.out+"|"+(x.dark?"141414FF":"FAFAF8FF"));
' | while IFS='|' read -r render out bg; do
  mkdir -p "$(dirname "$out")"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1080,1350 \
    --default-background-color="$bg" \
    --run-all-compositor-stages-before-draw --virtual-time-budget=5000 \
    --screenshot="$out" "file://$(pwd)/$render" >/dev/null 2>&1
  echo "✓ $out"
done
echo "완료 → out/"
