COMPOSE = docker compose -f ./docker-compose.yml

all: up

up:
	@echo "Starting containers..."
	@$(COMPOSE) up -d --build

logs:
	@$(COMPOSE) logs -f

down:
	@echo "Stopping and removing containers..."
	@$(COMPOSE) down

re: down up

.PHONY: up down logs