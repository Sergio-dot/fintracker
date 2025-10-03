.PHONY: dev

dev:
	npx concurrently \
		"uvicorn backend.server:app --reload" \
		"cd frontend && npm run start"
