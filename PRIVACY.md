# Privicy is the best policy
lets see how I protect yours

## Your data is used
1. [list your classes](commands/classroom.js#L92-L194)
2. [verify your email](commands/classroom.js#L68-L76)

## How your data is stored
your data is stored in plain json and will never be touched unless being read by the cache
see [bot-loop.sh](bot-loop.sh) for how the bot is ran
all data is stored on a Raspberry Pi 4b running rasbian with a desktop under ssh using keys 

## What data is collected
the only data collected is
1. your email (for usage in email verification and allowing other students to email you)
2. the classes you are in (for usage in providing class list and classes you share with other users)