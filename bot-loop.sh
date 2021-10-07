#!/bin/bash
git pull -f 2>&1 | tee -a bot.log
npm i 2>&1 | tee -a bot.log
node bot.js 2>&1 | tee -a bot.log || node fallback.js 2>&1 | tee -a bot.log
tail -n100 bot.log | tee bot.log
echo 'logs cut down to 100 lines'
$0