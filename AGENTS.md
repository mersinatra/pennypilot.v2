# AGENTS.MD - PennyPilot Application Guide

This document provides guidance for AI agents interacting with the PennyPilot application codebase.

## 1. Project Overview

PennyPilot is a personal finance management application. It consists of:
- A Flask backend serving a REST API for managing financial data.
- A single-page HTML frontend with JavaScript for user interaction and data display.
- Data is stored in an SQLite database.

The primary entities managed are: Categories, Transactions, Budgets, and Recurring Items.

## 2. Tech Stack

- **Backend**: Python, Flask, Flask-SQLAlchemy
- **Database**: SQLite
- **Frontend**: HTML, TailwindCSS, JavaScript (vanilla)
- **Dependency Management**: `requirements.txt` (for Python)

## 3. File Structure and Key Files

-   **`app.py`**:
    -   Main Flask application file.
    -   Defines all API endpoints (CRUD operations for Categories, Transactions, Budgets, Recurring Items).
    -   Initializes the database using `init_db(app)`.
    -   Serves static files, including `index.html` and `dashboard.js`.
-   **`database.py`**:
    -   Contains the SQLAlchemy `db` instance.
    -   Includes `init_db(app)` function which initializes the database, creates tables, and ensures a default "Uncategorized" category exists.
-   **`models.py`**:
    -   Defines the SQLAlchemy database models: `Category`, `Transaction`, `Budget`, `RecurringItem`.
    -   Each model includes a `to_dict()` method for JSON serialization.
-   **`index.html`**:
    -   The single-page frontend for the application.
    -   Uses TailwindCSS for styling.
    -   Contains the structure for the dashboard, different views (transactions, categories, etc.), and modals for creating/editing items.
-   **`dashboard.js`**:
    -   Handles all frontend JavaScript logic.
    -   Manages page navigation within the single-page app.
    -   Makes API calls to the Flask backend (e.g., `loadCategories`, `createTransaction`).
    -   Updates the DOM to display data and handles form submissions for modals.
-   **`requirements.txt`**:
    -   Lists Python dependencies (Flask, Flask-SQLAlchemy).
-   **`instance/`**:
    -   This directory is created automatically by `app.py` if it doesn't exist.
    -   **`instance/penny.db`**: The SQLite database file. It's created automatically on the first run.
-   **`README.md`**:
    -   General information about the project, setup, and API endpoints.

## 4. Running the Application

1.  **Create a virtual environment (recommended)**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run the application**:
    ```bash
    python app.py
    ```
    The application will be available at `http://127.0.0.1:5000/`.
    The `instance/penny.db` file will be created automatically if it doesn't exist.

## 5. API Endpoints

All API endpoints are defined in `app.py`. They follow standard RESTful patterns and exchange data in JSON format.

-   **Categories**:
    -   `GET /categories`: List all categories.
    -   `POST /categories`: Create a new category. (Payload: `{"name": "string"}`)
    -   `GET /categories/<id>`: Get a specific category.
    -   `PUT /categories/<id>`: Update a category. (Payload: `{"name": "string"}`)
    -   `DELETE /categories/<id>`: Delete a category.
-   **Transactions**:
    -   `GET /transactions`: List all transactions.
    -   `POST /transactions`: Create a new transaction. (Payload: `{"description": "string", "amount": float, "date": "YYYY-MM-DD", "category_id": int}`)
    -   `GET /transactions/<id>`: Get a specific transaction.
    -   `PUT /transactions/<id>`: Update a transaction. (Payload: fields to update)
    -   `DELETE /transactions/<id>`: Delete a transaction.
-   **Budgets**:
    -   `GET /budgets`: List all budgets.
    -   `POST /budgets`: Create a new budget. (Payload: `{"name": "string", "amount": float, "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" (optional)}`)
    -   `GET /budgets/<id>`: Get a specific budget.
    -   `PUT /budgets/<id>`: Update a budget. (Payload: fields to update)
    -   `DELETE /budgets/<id>`: Delete a budget.
-   **Recurring Items**:
    -   `GET /recurring_items`: List all recurring items.
    -   `POST /recurring_items`: Create a new recurring item. (Payload: `{"name": "string", "amount": float, "frequency": "string", "next_due_date": "YYYY-MM-DD"}`)
    -   `GET /recurring_items/<id>`: Get a specific recurring item.
    -   `PUT /recurring_items/<id>`: Update a recurring item. (Payload: fields to update)
    -   `DELETE /recurring_items/<id>`: Delete a recurring item.

## 6. Database (`instance/penny.db`)

-   The database is SQLite.
-   Schema is defined in `models.py`.
-   `init_db(app)` in `database.py` handles table creation (`db.create_all()`).
-   A default "Uncategorized" category with `id=1` is automatically created if it doesn't exist. This is important as `Transaction.category_id` defaults to 1.

## 7. Frontend (`index.html`, `dashboard.js`)

-   The frontend is a single-page application.
-   `dashboard.js` handles:
    -   Fetching data from the backend API.
    -   Rendering data into the HTML structure.
    -   Managing UI interactions (e.g., opening/closing modals, page switching).
    -   Submitting data from forms in modals to create/update backend resources.
-   Modals are defined in `index.html` for creating/editing items (transactions, categories, budgets, recurring items). Their visibility is toggled by JavaScript.
-   TailwindCSS classes are used extensively for styling.

## 8. Coding Conventions and Style

-   **Python**: Follow PEP 8. Use descriptive variable and function names.
-   **Flask**:
    -   Endpoints are defined directly in `app.py`. For larger applications, consider Flask Blueprints.
    -   Use `jsonify` for API responses.
    -   Use `abort(code)` for error responses.
-   **JavaScript**:
    -   Use modern JavaScript (ES6+).
    -   `async/await` is used for API calls in the `api()` helper function.
    -   DOM manipulation is done directly.
-   **HTML**: Use semantic HTML where appropriate.

## 9. Development Workflow & Making Changes

-   **Backend Changes**:
    -   **API Endpoints**: Modify or add routes in `app.py`.
    -   **Database Schema**: Modify models in `models.py`. If schema changes are made (e.g., adding a column), the database might need to be manually deleted and recreated, or a migration tool (like Alembic, not currently used) would be needed for existing data.
    -   **Business Logic**: Update logic within endpoint functions in `app.py`.
-   **Frontend Changes**:
    -   **UI Structure**: Modify `index.html`.
    -   **Interactivity/Data Handling**: Modify `dashboard.js`. This includes fetching new data, updating display functions, and handling new form submissions.
    -   **Styling**: Primarily use TailwindCSS classes in `index.html`.
-   **Adding a New Resource (e.g., "Goals")**:
    1.  Define the model in `models.py`.
    2.  Add CRUD API endpoints in `app.py`.
    3.  Update `database.py` if any special initialization is needed (usually `db.create_all()` is sufficient).
    4.  Add UI elements in `index.html` (list display area, modal for creation/editing, navigation links).
    5.  Add JavaScript functions in `dashboard.js` to:
        -   Load/display the new resource.
        -   Handle form submissions for creating/editing the resource.
        -   Populate any related dropdowns if necessary.

## 10. Important Notes for AI Agent

-   **Default Category**: The "Uncategorized" category (ID 1) is crucial. Ensure it's handled correctly, especially when creating transactions where `category_id` might be optional and defaults to 1.
-   **Error Handling**: Backend uses `abort(400)` for bad requests and `abort(404)` for not found. Frontend `api()` helper throws an error on non-OK responses.
-   **Date Handling**: Dates are expected in `YYYY-MM-DD` ISO format for API requests and are returned in the same format. The `date.fromisoformat()` and `date.isoformat()` methods are used.
-   **Modals**: CRUD operations on the frontend are typically initiated through modals. Ensure modal open/close logic and form submission handlers in `dashboard.js` are correctly managed.
-   **No Build Step**: The frontend is plain HTML/JS/CSS, so there's no build step required.
-   **Idempotency**: Ensure PUT and DELETE operations are idempotent where applicable.
-   **Data Integrity**: When deleting a category, consider how this affects transactions linked to it (currently, this would lead to a foreign key constraint error if transactions exist, or orphaned transactions if constraints are relaxed/not enforced strictly by SQLite by default in some configurations). The current implementation doesn't handle cascading deletes or re-assigning transactions.

This guide should help in understanding the project structure and making modifications. If new patterns or tools are introduced, this document should be updated.
