
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

clean: down
	@echo "Removing volumes..."
	@docker volume rm $$(docker volume ls -q) 2> /dev/null || true

fclean: clean
	@echo "Removing all images related to the project..."
	@docker rmi $$(docker images -q) 2> /dev/null || true

re: fclean up

.PHONY: all up down clean fclean re