.PHONY: help install build-frontend build-python build publish clean

help:
	@echo "Available commands:"
	@echo "  install        Install Python and frontend dependencies"
	@echo "  build-frontend Build React/Vite frontend assets"
	@echo "  build-python   Build Python package (sdist and wheel)"
	@echo "  build          Build both frontend and Python package"
	@echo "  publish        Upload built package to PyPI"
	@echo "  clean          Remove build artifacts"

install:
	pip install -e .
	cd st_vortree/frontend && npm install

build-frontend:
	cd st_vortree/frontend && npm run build

build-python: build-frontend
	rm -rf dist/
	cp pyproject.toml st_vortree/pyproject.toml
	python3 -m build
	rm -f st_vortree/pyproject.toml

build: build-python

publish: build-python
	python3 -m twine upload dist/*

clean:
	rm -rf dist/ build/ *.egg-info
	rm -rf st_vortree/frontend/dist/ st_vortree/pyproject.toml
