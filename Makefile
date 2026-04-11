RESET	:=	\033[0m
BOLD	:=	\033[1m
ITAL	:=	\033[3m
BLINK	:=	\033[5m

RED		:=	\033[30m
GREEN	:=	\033[32m
YELLOW	:=	\033[33m
BLUE	:=	\033[34m
CYAN	:=	\033[36m

NAME	:=	ft_transcendence

all: cert build up

cert:
	@if [ ! -f secrets/ssl/key.pem ]; then \
		IP=$$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $$1}' || echo "127.0.0.1"); \
		mkdir -p secrets/ssl; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout secrets/ssl/key.pem \
			-out secrets/ssl/cert.pem \
			-subj "/CN=$$IP" \
			-addext "subjectAltName=DNS:localhost,IP:$$IP,IP:127.0.0.1"; \
		echo "Certificate generated for IP: $$IP"; \
	else \
		echo "Certificate already exists, skipping..."; \
	fi

build:
	@echo "${CYAN}Building...${RESET}"
	docker compose build

up:
	docker compose up -d
	@echo "${GREEN}${BOLD}${BLINK}Containers are up !${RESET}"

dev: cert
	@echo "${CYAN}Building and starting with frontend Vite Dockerfile...${RESET}"
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
	@echo "${GREEN}${BOLD}${BLINK}Dev stack is up with Vite hot reload !${RESET}"

down:
	docker compose down
	@echo "${YELLOW}${BOLD}Containers have been shutdowned !${RESET}"

down-v:
	docker compose down -v
	@echo "${YELLOW}${BOLD}Containers have been shutdowned and volumes have been erased !${RESET}"

logs:
	docker compose logs

logs-rt:
	docker compose logs -f

status:
	docker compose ps -a

restart:
	docker compose restart
	@echo "${GREEN}${BOLD}${BLINK}All containers have been restarted !${RESET}"

recreate: down up
	@echo "${GREEN}${BOLD}${BLINK}All containers have been recreated !${RESET}"

clean:
	docker compose down -v --rmi all
	@echo "${YELLOW}${BOLD}Containers shutdowned, data and ALL images erased !${RESET}"

fclean:
	docker compose down -v --rmi all
	rm -rf ./secrets/ssl/
	docker builder prune -af
	@echo "${RED}${BOLD}Full clean-up has been achieved !${RESET}"

re: fclean all


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


help:
	@echo "${BLUE}${BOLD}COMMANDS:${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make${RESET}			${CYAN}${ITAL}- Create a certificate, build and start${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make build${RESET}		${CYAN}${ITAL}- Build all project images${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make up${RESET}		${CYAN}${ITAL}- Launch containers"
	@echo "${BLUE}${ITAL}${BOLD} make dev${RESET}		${CYAN}${ITAL}- Launch containers with frontend Vite hot reload${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make down${RESET}		${CYAN}${ITAL}- Shutdown containers"
	@echo "${BLUE}${ITAL}${BOLD} make down-v${RESET}		${CYAN}${ITAL}- Shutdown containers and erase volumes${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make logs${RESET}		${CYAN}${ITAL}- Show logs${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make logs-rt${RESET}		${CYAN}${ITAL}- Show logs in real-time${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make status${RESET}		${CYAN}${ITAL}- Show containers status${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make restart${RESET}		${CYAN}${ITAL}- Restart containers${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make clean${RESET}		${CYAN}${ITAL}- Shutdown containers and erase volumes and all images${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make fclean${RESET}		${CYAN}${ITAL}- Make a full clean-up, with a builder docker prune${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make re${RESET}		${CYAN}${ITAL}- Make a full clean-up, and execute 'ALL' rule${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-gateway${RESET}	${CYAN}${ITAL}- Execute a shell inside gateway container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-frontend${RESET}	${CYAN}${ITAL}- Execute a shell inside frontend container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-auth${RESET}	${CYAN}${ITAL}- Execute a shell inside auth container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-game${RESET}	${CYAN}${ITAL}- Execute a shell inside game container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-lobby${RESET}	${CYAN}${ITAL}- Execute a shell inside lobby container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-player${RESET}	${CYAN}${ITAL}- Execute a shell inside player container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-chat${RESET}	${CYAN}${ITAL}- Execute a shell inside chat container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-db${RESET}	${CYAN}${ITAL}- Execute a shell inside postgres container${RESET}"
	@echo "${BLUE}${ITAL}${BOLD} make shell-redis${RESET}	${CYAN}${ITAL}- Execute a shell inside redis container${RESET}"


.PHONY: all up down build dev clean fclean re
