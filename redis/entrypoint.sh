#!/bin/sh

REDIS_PASSWD=$(cat /run/secrets/redis_passwd)

exec redis-server --save 20 1 --loglevel warning --requirepass "$REDIS_PASSWD"
