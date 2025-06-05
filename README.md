# PennyPilot Backend

This simple Flask backend exposes REST API endpoints for managing
transactions, categories, budgets and recurring items.

## Environment Requirements

- Python 3.10 or newer
- `pip` for installing Python packages

## Setup

1. Create a virtual environment and install dependencies:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use venv\Scripts\activate
pip install -r requirements.txt
```

2. Run the application:

```bash
python app.py
```

The API uses an SQLite database located at `instance/penny.db`. The file will be
created automatically when the application starts.

### Configuration

Two optional environment variables can be used:

- `DATABASE_URI` – custom SQLAlchemy database URI (defaults to the SQLite file
  above)
- `LOG_LEVEL` – logging level (`DEBUG`, `INFO`, etc.)

## Running Tests

Automated tests use `pytest`. Ensure the development dependencies are installed
and then run:

```bash
pytest
```

## Endpoints

- `GET /categories`, `POST /categories`, `GET/PUT/DELETE /categories/<id>`
- `GET /transactions`, `POST /transactions`, `GET/PUT/DELETE /transactions/<id>`
- `GET /budgets`, `POST /budgets`, `GET/PUT/DELETE /budgets/<id>`
- `GET /recurring_items`, `POST /recurring_items`, `GET/PUT/DELETE /recurring_items/<id>`

All endpoints accept and return JSON.
