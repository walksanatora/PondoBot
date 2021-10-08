#!/bin/bash
while true; do
	git pull -f 2>&1 | tee -a bot.log
	npm i 2>&1 | tee -a bot.log
	node bot.js 2>&1 | tee -a bot.log
	if test $? != 0; then 
		echo 'running in fallback mode'
		node fallback.js 2>&1 | tee -a bot.log
	fi
	tail -n100 bot.log | tee bot.log
	echo 'logs cut down to 100 lines'
done