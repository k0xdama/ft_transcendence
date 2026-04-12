#!/bin/sh

REDIS_PASSWD=$(cat /run/secrets/redis_passwd)

exec redis-server \
	# Authenticate clients using the secret password
	--requirepass "$REDIS_PASSWD" \
	# Persist a snapshot to disk every 60s if at least 1 key changed
	--save 60 1 \
	# Log warnings and important events without flooding with debug info
	--loglevel notice \
	# Cap memory usage to prevent Redis from consuming all available RAM
	--maxmemory 256mb \
	# Evict least-recently-used keys first when memory limit is reached
	--maxmemory-policy allkeys-lru
