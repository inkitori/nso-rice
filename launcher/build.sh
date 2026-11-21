#!/bin/bash
# Builds ~/Applications/Windose Start.app and keeps it running at login (LaunchAgent).
set -e
cd "$(dirname "$0")"
A="$HOME/Applications/Windose Start.app"
ID=com.nso.windose-start
rm -rf "$A"; mkdir -p "$A/Contents/MacOS" "$A/Contents/Resources"
xcrun swiftc -O -o "$A/Contents/MacOS/WindoseStart" main.swift
cp assets/*.png "$A/Contents/Resources/"
cat > "$A/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleIdentifier</key><string>$ID</string>
  <key>CFBundleName</key><string>Windose Start</string>
  <key>CFBundleExecutable</key><string>WindoseStart</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>LSUIElement</key><true/>
</dict></plist>
EOF
codesign -s - --force "$A" >/dev/null 2>&1

P="$HOME/Library/LaunchAgents/$ID.plist"
cat > "$P" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$ID</string>
  <key>ProgramArguments</key><array><string>$A/Contents/MacOS/WindoseStart</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/windose-start.log</string>
</dict></plist>
EOF
launchctl bootout "gui/$(id -u)/$ID" 2>/dev/null || true
for _ in 1 2 3 4 5; do launchctl bootstrap "gui/$(id -u)" "$P" 2>/dev/null && break; sleep 1; done
echo "built $A"
