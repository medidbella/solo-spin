# ==============================================================================
# SOLO-SPIN SYSTEM MANAGEMENT INTERFACE
# Build, Deploy, and Monitor ELK + Full-Stack Environment
# ==============================================================================

-include .env
export

# --- TERMINAL COLORS ---
CYAN         := \033[0;36m
GREEN        := \033[0;32m
YELLOW       := \033[0;33m
RED          := \033[0;31m
BOLD         := \033[1m
RESET        := \033[0m

# --- ORCHESTRATION CONFIGURATION ---
# Modular Docker Compose setup
COMPOSE_BASE := -f docker-compose.yml
COMPOSE_ELK  := -f docker-compose.elk.yml
COMPOSE_DEV  := -f docker-compose.override.yml

# Helper to target all definitions for logs/down/ps
COMPOSE_ALL  := $(COMPOSE_BASE) $(COMPOSE_ELK) $(COMPOSE_DEV)

# --- ANALYTICS CONFIGURATION ---
DASH_DIR     := dashboards
DASH_FILE    := $(DASHBOARD_FILE_PATH)
KIBANA_URL   := https://localhost:8443/kibana
KIBANA_AUTH  := -u elastic:$(ELASTIC_PASSWORD)
KIBANA_HEAD  := -H "kbn-xsrf:true" -H "Content-Type:application/json"
KIBANA_BODY  := '{"type":["dashboard","visualization","lens","index-pattern","search","map","tag","config"],"includeReferencesDeep":true}'

.DEFAULT_GOAL := help

# ==============================================================================
# SYSTEM INITIALIZATION & HELP
# ==============================================================================

help: ## Show this help message
	@echo "  ____   ___  _      ___        ____  ____  ____  _   _ "
	@echo " / ___| / _ \| |    / _ \      / ___||  _ \|_ _|| \ | |"
	@echo " \___ \| | | | |   | | | |_____\___ \| |_) || | |  \| |"
	@echo "  ___) | |_| | |___| |_| |_____|___) |  __/ | | | |\  |"
	@echo " |____/ \___/|_____|\___/     |____/|_|   |___||_| \_|"
	@echo ""
	@echo "$(BOLD)System Management Utility$(RESET)"
	@echo "Usage: make $(CYAN)[target]$(RESET)"
	@echo ""
	@echo "$(BOLD)COMMAND REFERENCE:$(RESET)"
	@grep -Eh '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-15s$(RESET) %s\n", $$1, $$2}'


# ==============================================================================
# SYSTEM BOOTSTRAP
# ==============================================================================

init: ## First-time setup: Configures .env, permissions, and certificates
	@echo "$(BOLD)Bootstrapping Solo-Spin Environment...$(RESET)"
	
	@# 1. Handle .env file
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)[INFO] .env not found. Creating from env.sample...$(RESET)"; \
		if [ -f env.sample ]; then \
			cp env.sample .env; \
			echo "$(GREEN)[OK] .env created.$(RESET)"; \
		else \
			echo "$(RED)[ERROR] env.sample not found!$(RESET)"; \
			exit 1; \
		fi \
	else \
		echo "$(CYAN)[INFO] .env already exists. Skipping.$(RESET)"; \
	fi

# ==============================================================================
# LIFECYCLE MANAGEMENT
# ==============================================================================

dev-app:   ## Start development stack WITHOUT ELK (App only)
	@echo "$(YELLOW)[INFO] Starting App without ELK...$(RESET)"
	@docker compose $(COMPOSE_BASE) $(COMPOSE_DEV) up -d --remove-orphans
	@echo "$(GREEN)[SUCCESS] Endpoint active: https://localhost:8443$(RESET)"

dev-app-build: ## Start development stack WITHOUT ELK (App only) + build
	@echo "$(YELLOW)[INFO] Starting App without ELK + build ...$(RESET)"
	@docker compose $(COMPOSE_BASE) $(COMPOSE_DEV) up -d --build --remove-orphans
	@echo "$(GREEN)[SUCCESS] Endpoint active: https://localhost:8443$(RESET)"

dev: ## Start full development stack (App + ELK)
	@echo "$(YELLOW)[INFO] Starting Full Stack (App + ELK)...$(RESET)"
	@docker compose $(COMPOSE_BASE) $(COMPOSE_ELK) $(COMPOSE_DEV) up -d --remove-orphans
	@echo "$(GREEN)[SUCCESS] Endpoint active: https://localhost:8443$(RESET)"

prod: ## Build and deploy production stack (Immutable images, No hot-reload) 
	@echo "$(CYAN)[INFO] Deploying Production...$(RESET)"
	@docker compose $(COMPOSE_BASE) $(COMPOSE_ELK) up -d --build --remove-orphans
	@echo "$(GREEN)[SUCCESS] Endpoint active: https://localhost:8443$(RESET)"

down: ## Stop and remove all containers (App & ELK)
	@echo "$(RED)[WARN] Terminating services...$(RESET)"
	@docker compose $(COMPOSE_ALL) down --remove-orphans


# ==============================================================================
# OBSERVABILITY & DIAGNOSTICS
# ==============================================================================

logs: ## Stream logs from all active services
	@echo "$(CYAN)[INFO] Streaming system logs...$(RESET)"
	@docker compose $(COMPOSE_ALL) logs -f --tail=100

ps: ## Show status of all services
	@docker compose $(COMPOSE_ALL) ps

# ==============================================================================
# ANALYTICS ASSETS (KIBANA)
# ==============================================================================

db-export: ## Export Kibana Dashboards to local file
	@mkdir -p $(DASH_DIR)
	@echo "$(YELLOW)[INFO] Exporting analytics metadata...$(RESET)"
	@curl -s -k -f -X POST "$(KIBANA_URL)/api/saved_objects/_export" $(KIBANA_AUTH) $(KIBANA_HEAD) -d $(KIBANA_BODY) > $(DASH_FILE)
	@echo "$(GREEN)[SUCCESS] Assets written to $(DASH_FILE)$(RESET)"

db-import: ## Import Kibana Dashboards from local file
	@mkdir -p $(DASH_DIR)
	@echo "$(YELLOW)[INFO] Restoring analytics metadata...$(RESET)"
	@curl -s -k -X POST "$(KIBANA_URL)/api/saved_objects/_import?overwrite=true" $(KIBANA_AUTH) -H "kbn-xsrf:true" --form file=@$(DASH_FILE) > /dev/null
	@echo "$(GREEN)[SUCCESS] Assets restored.$(RESET)"


# ==============================================================================
# RESET OPTIONS
# ==============================================================================

clean: ## Danger: clean volumes, images, and certificates
	@echo "$(RED)[DANGER] Irreversible purge: Volumes and SSL Keys will be deleted.$(RESET)"
	@docker volume rm $(docker volume ls) || true
	@docker compose $(COMPOSE_ALL) down -v --rmi local
	@docker run --rm -v $(PWD):/app -w /app alpine sh -c 'rm -rf elk/certs/* nginx/certs/*'
	@echo "$(GREEN)[INFO] System purged.$(RESET)"

remove-database: ## Danger: remove backend-database
	@echo "$(RED)[DANGER] Irreversible purge: Database will be deleted.$(RESET)"
	@docker run --rm -v $(PWD):/app -w /app alpine sh -c 'rm -rf backend/data/*.db'
	@echo "$(GREEN)[INFO] Database purged.$(RESET)"

shutdown : clean remove-database ## Danger: quick delete  volumes, database, images, and certificate

re: down clean prod ## Danger: quick refresh (volumes delete is included)

reset: ## Danger: Deep clean volumes, database, images, and certificates
	@echo "$(RED)[DANGER] Hard-reset means: Volumes, Database, and SSL Keys will be deleted.$(RESET)"
	@# 1. Prompt the user. If they don't say 'y', the command fails and stops here.
	@read -p "Confirm destructive action? [y/N] " ans && [ "$${ans:-N}" = "y" ]
	@# 2. If we passed the check, now we trigger the other targets manually
	@echo "$(YELLOW)[INFO] Stopping containers first...$(RESET)"
	@docker compose down  # Safety: Stop containers before deleting files
	@$(MAKE) remove-database
	@$(MAKE) re
	@echo "$(GREEN)[INFO] System Hard Reset Complete.$(RESET)"

hard-reset: ## Danger: Prune all system , volumes and Deep clean volumes, database, images, and certificates 
	@echo "$(RED)[DANGER] Hard-reset means: Volumes, Database, and SSL Keys will be deleted.$(RESET)"
	@# 1. Prompt the user. If they don't say 'y', the command fails and stops here.
	@read -p "Confirm destructive action? [y/N] " ans && [ "$${ans:-N}" = "y" ]
	@# 2. If we passed the check, now we trigger the other targets manually
	@echo "$(YELLOW)[INFO] Stopping containers first...$(RESET)"
	@docker compose down  # Safety: Stop containers before deleting files
	@$(MAKE) remove-database
	@docker system prune
	@docker volume prune
	@$(MAKE) re
	@echo "$(GREEN)[INFO] System Hard Reset Complete.$(RESET)"




.PHONY: help dev prod down clean logs ps db-gen db-push db-studio db-export db-import