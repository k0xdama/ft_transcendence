#!/bin/sh

REDIS_PASSWD=$(cat /run/secrets/redis_passwd)

exec redis-server \
	--requirepass "$REDIS_PASSWD" \
	--save 60 1 \
	--loglevel notice \
	--maxmemory 256mb \
	--maxmemory-policy allkeys-lru
