#!/usr/bin/env bash
# Emulatorda APK'ni ishga tushirib, logcat va skrinshot yig'adi (diag/ papkaga)
APK=android/app/build/outputs/apk/debug/app-debug.apk
mkdir -p diag
adb install -r "$APK" > diag/install.txt 2>&1
adb logcat -c
adb shell am start -W -n com.example.lynxapp/.MainActivity > diag/start.txt 2>&1
sleep 25
adb exec-out screencap -p > diag/screen.png
adb logcat -d -v time > diag/logcat.txt
adb shell pidof com.example.lynxapp > diag/pid.txt 2>&1 || echo "jarayon yo'q (crash?)" > diag/pid.txt
exit 0
