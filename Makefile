.PHONY: dev

dev:
	cd frontend && npx concurrently \
		"cd .. && uvicorn backend.server:app --reload" \
		"npm run start"