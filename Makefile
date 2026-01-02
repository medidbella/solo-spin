include .env
export

COMPOSE := docker compose -f ./docker-compose.yml
DIR := dashboards
FILE := $(DIR)/dashboard.ndjson
URL := http://localhost:$(if $(KIBANA_PORT),$(KIBANA_PORT),5601)

AUTH := -u elastic:$(ELASTIC_PASSWORD)
HEAD := -H "kbn-xsrf:true" -H "Content-Type:application/json"
BODY := '{"type":["dashboard","visualization","lens","index-pattern","search","map","tag","config"],"includeReferencesDeep":true}'
all: up

up:
	@$(COMPOSE) up -d --build

down:
	@$(COMPOSE) down

init:
	@mkdir -p $(DIR)

get: init
	@curl -s -f -X POST "$(URL)/api/saved_objects/_export" $(AUTH) $(HEAD) -d $(BODY) > $(FILE)
	@echo "Saved to $(FILE)"

set: init
	curl -s -X POST "$(URL)/api/saved_objects/_import?overwrite=true" $(AUTH) -H "kbn-xsrf:true" --form file=@$(FILE) >/dev/null; \
	echo "✅ Restored."

.PHONY: all up down init get set