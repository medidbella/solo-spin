include .env
export

COMPOSE := docker compose -f ./docker-compose.yml
DIR := dashboards
FILE := $(DIR)/dashboard.ndjson
TMP := $(DIR)/.tmp.ndjson
URL := http://localhost:$(if $(KIBANA_PORT),$(KIBANA_PORT),5601)

AUTH := -u elastic:$(ELASTIC_PASSWORD)
HEAD := -H "kbn-xsrf:true" -H "Content-Type:application/json"
BODY := '{"type":["dashboard","visualization","lens","index-pattern","search","map","tag","config"],"includeReferencesDeep":true}'
PY_MAX := python3 -c "import sys,json;print(max([json.loads(l).get('updated_at','0') for l in sys.stdin if l.strip()] or ['0']))"

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
	@test -s $(FILE) || { echo "Missing $(FILE)"; exit 1; }
	@L_TS=$$(cat $(FILE) | $(PY_MAX) 2>/dev/null); \
	curl -s -f -X POST "$(URL)/api/saved_objects/_export" $(AUTH) $(HEAD) -d $(BODY) > $(TMP); \
	S_TS=$$(cat $(TMP) | $(PY_MAX) 2>/dev/null); rm -f $(TMP); \
	echo "Local: $$L_TS | Server: $$S_TS"; \
	if [ "$$S_TS" != "0" ] && [ "$$S_TS" \> "$$L_TS" ]; then \
		read -p "⚠️ Server is NEWER. Overwrite? [y/N] " C; [ "$$C" != "y" ] && exit 1; \
	fi; \
	curl -s -X POST "$(URL)/api/saved_objects/_import?overwrite=true" $(AUTH) -H "kbn-xsrf:true" --form file=@$(FILE) >/dev/null; \
	echo "✅ Restored."

.PHONY: all up down init get set