#!/bin/sh

# if RUN_BOT = true
if [ "$RUN_BOT" = "true" ]; then
  echo "Running bot"
  python bot.py &
fi
gunicorn --bind 0.0.0.0:80 app:app
