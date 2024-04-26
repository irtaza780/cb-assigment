install:
	@command -v node >/dev/null 2>&1 || { \
		echo >&2 "Node.js is not installed. Installing it..."; \
		sudo apt update && sudo apt install nodejs; \
	}
	npm install
start:
	npm start

.PHONY: install start
