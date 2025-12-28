include .env
export

COMPOSE = docker compose -f ./docker-compose.yml
KIBANA_DIR = dashboards
KIBANA_FILE = $(KIBANA_DIR)/dashboard.ndjson
TEMP_FILE = $(KIBANA_DIR)/.temp_dashboard.ndjson
PORT := $(if $(KIBANA_PORT),$(KIBANA_PORT),5601)
KIBANA_URL = http://localhost:$(PORT)


all: up

up:
	@echo "Starting containers..."
	@$(COMPOSE) up -d --build

logs:
	@$(COMPOSE) logs -f

down:
	@echo "Stopping containers (Data preserved)..."
	@$(COMPOSE) down

re: down up

init_dir:
	@mkdir -p $(KIBANA_DIR)

# "make get": Export EVERYTHING (Clean Version)
get: init_dir
	@echo "💾 Fetching FULL Configs from Kibana..."
	@curl -s -f -X POST "$(KIBANA_URL)/api/saved_objects/_export" \
		-u elastic:$(ELASTIC_PASSWORD) \
		-H "kbn-xsrf: true" \
		-H "Content-Type: application/json" \
		-d '{"type":["dashboard","visualization","lens","index-pattern","search","map","canvas-workpad","canvas-element","tag","config"],"includeReferencesDeep":true}' \
		> $(TEMP_FILE)
	@if [ -s $(TEMP_FILE) ]; then \
		mv $(TEMP_FILE) $(KIBANA_FILE); \
		echo "✅ Success! Full Backup updated."; \
	else \
		echo "❌ Error: Empty file received. Aborting."; \
		rm -f $(TEMP_FILE); \
		exit 1; \
	fi
set:
	@echo "♻️  Loading Configs from $(KIBANA_FILE) to Kibana..."
	@curl -s -f -X POST "$(KIBANA_URL)/api/saved_objects/_import?overwrite=true" \
		-u elastic:$(ELASTIC_PASSWORD) \
		-H "kbn-xsrf: true" \
		--form file=@$(KIBANA_FILE)
	@echo "✅ Loaded successfully!"

.PHONY: all up down logs re get set init_dir