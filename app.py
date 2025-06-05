from datetime import date
import logging
import os

from flask import Flask, jsonify, request, abort, send_from_directory

from database import init_db, db
from models import Category, Transaction, Budget, RecurringItem


# Serve static files like index.html and dashboard.js from the project root
app = Flask(__name__, static_url_path="", static_folder=".")
# Ensure the instance folder exists and set the database path
db_path = os.path.join(app.root_path, "instance", "penny.db")
os.makedirs(os.path.dirname(db_path), exist_ok=True)

db_uri = os.environ.get("DATABASE_URI", f"sqlite:///{db_path}")
app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, log_level, logging.INFO))

init_db(app)


# Helper for generic CRUD operations

def get_model(model, model_id):
    item = model.query.get(model_id)
    if not item:
        abort(404)
    return item


# Category endpoints
@app.route("/categories", methods=["GET"])
def list_categories():
    return jsonify([c.to_dict() for c in Category.query.all()])


@app.route("/categories", methods=["POST"])
def create_category():
    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        abort(400)
    category = Category(name=name)
    db.session.add(category)
    db.session.commit()
    app.logger.info("Created category %s", category.id)
    return jsonify(category.to_dict()), 201


@app.route("/categories/<int:category_id>", methods=["GET"])
def get_category(category_id):
    category = get_model(Category, category_id)
    return jsonify(category.to_dict())


@app.route("/categories/<int:category_id>", methods=["PUT"])
def update_category(category_id):
    category = get_model(Category, category_id)
    data = request.get_json() or {}
    if "name" in data:
        category.name = data["name"]
    db.session.commit()
    app.logger.info("Updated category %s", category.id)
    return jsonify(category.to_dict())


@app.route("/categories/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    category = get_model(Category, category_id)
    # Prevent deletion if any transactions reference this category
    in_use = Transaction.query.filter_by(category_id=category_id).count()
    if in_use:
        abort(400, description="Category in use by transactions")

    db.session.delete(category)
    db.session.commit()
    app.logger.info("Deleted category %s", category.id)
    return "", 204


# Transaction endpoints
@app.route("/transactions", methods=["GET"])
def list_transactions():
    return jsonify([t.to_dict() for t in Transaction.query.all()])


@app.route("/transactions", methods=["POST"])
def create_transaction():
    data = request.get_json() or {}
    try:
        t = Transaction(
            description=data["description"],
            amount=float(data["amount"]),
            date=date.fromisoformat(data.get("date", date.today().isoformat())),
            category_id=data.get("category_id", 1),
        )
    except (KeyError, ValueError):
        abort(400)
    db.session.add(t)
    db.session.commit()
    app.logger.info("Created transaction %s", t.id)
    return jsonify(t.to_dict()), 201


@app.route("/transactions/<int:transaction_id>", methods=["GET"])
def get_transaction(transaction_id):
    t = get_model(Transaction, transaction_id)
    return jsonify(t.to_dict())


@app.route("/transactions/<int:transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    t = get_model(Transaction, transaction_id)
    data = request.get_json() or {}
    if "description" in data:
        t.description = data["description"]
    if "amount" in data:
        t.amount = float(data["amount"])
    if "date" in data:
        t.date = date.fromisoformat(data["date"])
    if "category_id" in data:
        t.category_id = data["category_id"]
    db.session.commit()
    app.logger.info("Updated transaction %s", t.id)
    return jsonify(t.to_dict())


@app.route("/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    t = get_model(Transaction, transaction_id)
    db.session.delete(t)
    db.session.commit()
    app.logger.info("Deleted transaction %s", t.id)
    return "", 204


# Budget endpoints
@app.route("/budgets", methods=["GET"])
def list_budgets():
    return jsonify([b.to_dict() for b in Budget.query.all()])


@app.route("/budgets", methods=["POST"])
def create_budget():
    data = request.get_json() or {}
    try:
        b = Budget(
            name=data["name"],
            amount=float(data["amount"]),
            start_date=date.fromisoformat(data["start_date"]),
            end_date=date.fromisoformat(data["end_date"]) if data.get("end_date") else None,
        )
    except (KeyError, ValueError):
        abort(400)
    db.session.add(b)
    db.session.commit()
    app.logger.info("Created budget %s", b.id)
    return jsonify(b.to_dict()), 201


@app.route("/budgets/<int:budget_id>", methods=["GET"])
def get_budget(budget_id):
    b = get_model(Budget, budget_id)
    return jsonify(b.to_dict())


@app.route("/budgets/<int:budget_id>", methods=["PUT"])
def update_budget(budget_id):
    b = get_model(Budget, budget_id)
    data = request.get_json() or {}
    if "name" in data:
        b.name = data["name"]
    if "amount" in data:
        b.amount = float(data["amount"])
    if "start_date" in data:
        b.start_date = date.fromisoformat(data["start_date"])
    if "end_date" in data:
        b.end_date = (
            date.fromisoformat(data["end_date"]) if data["end_date"] else None
        )
    db.session.commit()
    app.logger.info("Updated budget %s", b.id)
    return jsonify(b.to_dict())


@app.route("/budgets/<int:budget_id>", methods=["DELETE"])
def delete_budget(budget_id):
    b = get_model(Budget, budget_id)
    db.session.delete(b)
    db.session.commit()
    app.logger.info("Deleted budget %s", b.id)
    return "", 204


# RecurringItem endpoints
@app.route("/recurring_items", methods=["GET"])
def list_recurring_items():
    return jsonify([r.to_dict() for r in RecurringItem.query.all()])


@app.route("/recurring_items", methods=["POST"])
def create_recurring_item():
    data = request.get_json() or {}
    try:
        r = RecurringItem(
            name=data["name"],
            amount=float(data["amount"]),
            frequency=data["frequency"],
            next_due_date=date.fromisoformat(data["next_due_date"]),
        )
    except (KeyError, ValueError):
        abort(400)
    db.session.add(r)
    db.session.commit()
    app.logger.info("Created recurring item %s", r.id)
    return jsonify(r.to_dict()), 201


@app.route("/recurring_items/<int:item_id>", methods=["GET"])
def get_recurring_item(item_id):
    r = get_model(RecurringItem, item_id)
    return jsonify(r.to_dict())


@app.route("/recurring_items/<int:item_id>", methods=["PUT"])
def update_recurring_item(item_id):
    r = get_model(RecurringItem, item_id)
    data = request.get_json() or {}
    if "name" in data:
        r.name = data["name"]
    if "amount" in data:
        r.amount = float(data["amount"])
    if "frequency" in data:
        r.frequency = data["frequency"]
    if "next_due_date" in data:
        r.next_due_date = date.fromisoformat(data["next_due_date"])
    db.session.commit()
    app.logger.info("Updated recurring item %s", r.id)
    return jsonify(r.to_dict())


@app.route("/recurring_items/<int:item_id>", methods=["DELETE"])
def delete_recurring_item(item_id):
    r = get_model(RecurringItem, item_id)
    db.session.delete(r)
    db.session.commit()
    app.logger.info("Deleted recurring item %s", r.id)
    return "", 204

@app.route('/')
def index():
    """Serve the main dashboard."""
    return send_from_directory('.', 'index.html')


if __name__ == "__main__":
    app.run(debug=True)
