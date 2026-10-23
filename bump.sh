#!/bin/sh
# set cache-busting version tag to current time before commit
V=$(date +%Y%m%d%H%M)
sed -i -E "s/js\/app\.js\?v=[A-Za-z0-9]+/js\/app.js?v=$V/" index.html
for f in js/*.js; do sed -i -E "s/(\.\/[a-z0-9]+\.js)\?v=[A-Za-z0-9]+/\1?v=$V/g" $f; done
echo $V
