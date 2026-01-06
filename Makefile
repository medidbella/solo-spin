# ==============================================================================
# SOLO-SPIN SYSTEM MANAGEMENT INTERFACE
# Build, Deploy, and Monitor ELK + Full-Stack Environment
# ==============================================================================

include .env
export

# --- TERMINAL COLORS ---
CYAN         := \033[0;36m
GREEN        := \033[0;32m
YELLOW       := \033[0;33m
RED          := \033[0;31m
BOLD         := \033[1m
RESET        := \033[0m

# --- ORCHESTRATION CONFIGURATION ---
COMPOSE_BASE := docker compose -f ./docker-compose.yml
# COMPOSE_OVERRIDE := docker compose -f ./docker-compose.override.yml
COMPOSE      := $(COMPOSE_BASE)

# --- ANALYTICS CONFIGURATION ---
DASH_DIR     := dashboards
DASH_FILE    := $(DASH_DIR)/dashboard.ndjson
KIBANA_URL   := http://localhost:$(or $(KIBANA_PORT),5601)
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
# SYSTEM BOOTSTRAP (NEW)
# ==============================================================================

init: ## First-time setup: Configures .env, permissions, and certs
	@echo "$(BOLD)Bootstrapping Solo-Spin Environment...$(RESET)"
	
	@# 1. Handle .env file
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)[INFO] .env not found. Creating from .env.example...$(RESET)"; \
		if [ -f .env.example ]; then \
			cp .env.example .env; \
			echo "$(GREEN)[OK] .env created. Please update secrets if needed.$(RESET)"; \
		else \
			echo "$(RED)[ERROR] .env.example not found!$(RESET)"; \
			exit 1; \
		fi \
	else \
		echo "$(CYAN)[INFO] .env already exists. Skipping.$(RESET)"; \
	fi

	@# 2. Setup Logs Directory & Permissions
	@echo "$(YELLOW)[INFO] Configuring log directories and permissions...$(RESET)"
	@mkdir -p logs
	@chmod 777 logs
	@touch logs/.gitkeep
	@echo "$(GREEN)[OK] Logs directory ready.$(RESET)"

	@# 3. Generate ELK Certs
	@echo "$(YELLOW)[INFO] Generating SSL Certificates (this may take a moment)...$(RESET)"
	@$(COMPOSE_BASE) up setup
	@echo "$(GREEN)[SUCCESS] Initialization complete. Run 'make dev' to start.$(RESET)"
	
# ==============================================================================
# LIFECYCLE MANAGEMENT
# ==============================================================================

dev: ## Initialize development environment with Hot Module Replacement
	@echo "$(YELLOW)[INFO] Initializing development stack...$(RESET)"
	@$(COMPOSE_BASE) -f ./docker-compose.override.yml up -d
	@echo "$(GREEN)[SUCCESS] Endpoint active: https://localhost:8443$(RESET)"

prod: ## Execute production-grade build and deployment
	@echo "$(CYAN)[INFO] Executing production build sequence...$(RESET)"
	@$(COMPOSE_BASE) up -d --build
	@echo "$(GREEN)[SUCCESS] Production stack deployed.$(RESET)"

down: ## Terminate all active service containers
	@echo "$(RED)[WARN] Terminating services...$(RESET)"
	@$(COMPOSE) down

clean: ## Purge persistent volumes, local images, and SSL artifacts
	@echo "$(RED)[DANGER] Irreversible purge: Volumes, Database, and SSL Keys will be deleted.$(RESET)"
	@read -p "Confirm destructive action? [y/N] " ans && [ $${ans:-N} = y ]
	@$(COMPOSE) down -v --rmi local
	@rm -rf nginx_certs/*.crt nginx_certs/*.key
	@echo "$(GREEN)[INFO] System purged.$(RESET)"

# ==============================================================================
# OBSERVABILITY & DIAGNOSTICS
# ==============================================================================

logs: ## Aggregate and stream logs from all active containers
	@echo "$(CYAN)[INFO] Streaming system logs...$(RESET)"
	@$(COMPOSE) logs -f --tail=100

ps: ## Display operational status of system services
	@$(COMPOSE) ps

# ==============================================================================
# DATA PERSISTENCE & SCHEMA MANAGEMENT
# ==============================================================================

db-gen: ## Regenerate Prisma ORM client artifacts
	@$(COMPOSE) exec backend npx prisma generate

db-push: ## Synchronize database schema with current Prisma definition
	@$(COMPOSE) exec backend npx prisma db push

db-studio: ## Launch Prisma Studio administrative interface
	@$(COMPOSE) exec backend npx prisma studio

# ==============================================================================
# ANALYTICS ASSETS (KIBANA)
# ==============================================================================

db-export: ## Export Kibana saved objects to local filesystem
	@mkdir -p $(DASH_DIR)
	@echo "$(YELLOW)[INFO] Exporting analytics metadata...$(RESET)"
	@curl -s -f -X POST "$(KIBANA_URL)/api/saved_objects/_export" $(KIBANA_AUTH) $(KIBANA_HEAD) -d $(KIBANA_BODY) > $(DASH_FILE)
	@echo "$(GREEN)[SUCCESS] Assets written to $(DASH_FILE)$(RESET)"

db-import: ## Import Kibana saved objects from local filesystem
	@mkdir -p $(DASH_DIR)
	@echo "$(YELLOW)[INFO] Restoring analytics metadata...$(RESET)"
	@curl -s -X POST "$(KIBANA_URL)/api/saved_objects/_import?overwrite=true" $(KIBANA_AUTH) -H "kbn-xsrf:true" --form file=@$(DASH_FILE) > /dev/null
	@echo "$(GREEN)[SUCCESS] Assets restored.$(RESET)"

.PHONY: help dev prod down clean logs ps db-gen db-push db-studio db-export db-import