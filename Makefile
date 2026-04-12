#—————————————————————
#	ANSI
#—————————————————————

RESET		:=	\033[0m
BOLD		:=	\033[1m
ITAL		:=	\033[3m
BLINK		:=	\033[5m

RED			:=	\033[31m
GREEN		:=	\033[32m
P_GREEN		:=	\033[38;2;173;235;179m
P_YELLOW	:=	\033[38;2;255;234;150m
BLUE		:=	\033[34m
P_BLUE		:=	\033[38;2;179;235;242m
CYAN		:=	\033[36m

#—————————————————————
#	PROGRAM NAME
#—————————————————————

NAME	:=	ft_transcendence

#—————————————————————
#	RULES
#—————————————————————

all: cert env secrets build up

cert:
	bash ./scripts/setup-cert.sh

env:
	bash ./scripts/setup-env.sh

secrets:
	bash ./scripts/setup-secrets.sh

build:
	@echo "${CYAN}${BOLD}Building...${RESET}"
	docker compose build

up:
	docker compose up -d
	@echo "${P_GREEN}${BOLD}${BLINK}Containers are up!${RESET}"

dev: cert env secrets
	@echo "${CYAN}Building and starting with frontend Vite Dockerfile...${RESET}"
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
	@echo "${P_GREEN}${BOLD}${BLINK}Dev stack is up with Vite hot reload!${RESET}"

down:
	docker compose down
	@echo "${P_YELLOW}${BOLD}Containers have been shutdowned!${RESET}"

down-v:
	docker compose down -v
	@echo "${P_YELLOW}${BOLD}Containers have been shutdowned and volumes have been erased!${RESET}"

logs:
	docker compose logs

logs-rt:
	docker compose logs -f

status:
	docker compose ps -a

restart:
	docker compose restart
	@echo "${GREEN}${BOLD}${BLINK}All containers have been restarted!${RESET}"

recreate: down up
	@echo "${GREEN}${BOLD}${BLINK}All containers have been recreated!${RESET}"

clean:
	docker compose down -v --rmi all
	@echo "${P_YELLOW}${BOLD}Containers shutdowned, data and ALL images erased!${RESET}"

fclean:
	docker compose down -v --rmi all
	rm -rf ./secrets/ssl
# 	rm -rf ./secrets/*
# 	rm -rf .env
	docker builder prune -af
	@echo "${RED}${BOLD}Full clean-up has been achieved!${RESET}"

re: fclean all

#—————————————————————
#	CONTAINER RULES
#—————————————————————

shell-gateway:
		docker exec -it gateway /bin/bash
shell-frontend:
		docker exec -it frontend /bin/bash
shell-auth:
		docker exec -it auth /bin/bash
shell-game:
		docker exec -it game /bin/bash
shell-lobby:
		docker exec -it lobby /bin/bash
shell-player:
		docker exec -it player /bin/bash
shell-chat:
		docker exec -it chat /bin/bash
shell-db:
		docker exec -it postgres /bin/bash
shell-redis:
		docker exec -it redis /bin/bash

#—————————————————————
#	HELP MENU
#—————————————————————

help:
	@echo "${BLUE}${BOLD}COMMANDS:${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make${RESET}			${P_BLUE}${ITAL}- Create a certificate, add env variables, setup secrets, build and start${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make cert${RESET}		${P_BLUE}${ITAL}- Generate SSL certificate${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make env${RESET}		${P_BLUE}${ITAL}- Create .env file with default values${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make secrets${RESET}		${P_BLUE}${ITAL}- Configure secrets (DB, Redis, JWT)${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make build${RESET}		${P_BLUE}${ITAL}- Build all project images${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make up${RESET}		${P_BLUE}${ITAL}- Launch containers${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make dev${RESET}		${P_BLUE}${ITAL}- Launch containers with frontend Vite hot reload${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make down${RESET}		${P_BLUE}${ITAL}- Shutdown containers${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make down-v${RESET}		${P_BLUE}${ITAL}- Shutdown containers and erase volumes${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make logs${RESET}		${P_BLUE}${ITAL}- Show logs${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make logs-rt${RESET}		${P_BLUE}${ITAL}- Show logs in real-time${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make status${RESET}		${P_BLUE}${ITAL}- Show containers status${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make restart${RESET}		${P_BLUE}${ITAL}- Restart containers${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make clean${RESET}		${P_BLUE}${ITAL}- Shutdown containers and erase volumes and all images${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make fclean${RESET}		${P_BLUE}${ITAL}- Make a full clean-up, with a builder docker prune${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make re${RESET}		${P_BLUE}${ITAL}- Make a full clean-up, and execute 'ALL' rule${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-gateway${RESET}	${P_BLUE}${ITAL}- Execute a shell inside gateway container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-frontend${RESET}	${P_BLUE}${ITAL}- Execute a shell inside frontend container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-auth${RESET}	${P_BLUE}${ITAL}- Execute a shell inside auth container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-game${RESET}	${P_BLUE}${ITAL}- Execute a shell inside game container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-lobby${RESET}	${P_BLUE}${ITAL}- Execute a shell inside lobby container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-player${RESET}	${P_BLUE}${ITAL}- Execute a shell inside player container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-chat${RESET}	${P_BLUE}${ITAL}- Execute a shell inside chat container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-db${RESET}	${P_BLUE}${ITAL}- Execute a shell inside postgres container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-redis${RESET}	${P_BLUE}${ITAL}- Execute a shell inside redis container${RESET}"


.PHONY: all cert env secrets build up dev down clean fclean re
