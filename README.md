# PennyPilot Backend

This simple Flask backend exposes REST API endpoints for managing
transactions, categories, budgets and recurring items.

## Setup

1. Create a virtual environment and install dependencies:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Run the application:

```bash
python app.py
```

The API uses an SQLite database `penny.db` in the repository directory.

## Endpoints

- `GET /categories`, `POST /categories`, `GET/PUT/DELETE /categories/<id>`
- `GET /transactions`, `POST /transactions`, `GET/PUT/DELETE /transactions/<id>`
- `GET /budgets`, `POST /budgets`, `GET/PUT/DELETE /budgets/<id>`
- `GET /recurring_items`, `POST /recurring_items`, `GET/PUT/DELETE /recurring_items/<id>`

All endpoints accept and return JSON.
