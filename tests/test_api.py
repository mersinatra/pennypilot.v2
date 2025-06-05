import os
import sys
import pytest


os.environ["DATABASE_URI"] = "sqlite:///:memory:"
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import app, db  # noqa: E402


@pytest.fixture(autouse=True)
def setup_db():
    with app.app_context():
        db.drop_all()
        db.create_all()
        from models import Category

        if not Category.query.get(1):
            db.session.add(Category(id=1, name="Uncategorized"))
            db.session.commit()
    yield


def test_category_crud():
    client = app.test_client()

    # List categories (should contain default)
    resp = client.get("/categories")
    assert resp.status_code == 200
    data = resp.get_json()
    assert any(c["id"] == 1 for c in data)

    # Create
    resp = client.post("/categories", json={"name": "Food"})
    assert resp.status_code == 201
    new_id = resp.get_json()["id"]

    # Read
    resp = client.get(f"/categories/{new_id}")
    assert resp.status_code == 200
    assert resp.get_json()["name"] == "Food"

    # Update
    resp = client.put(f"/categories/{new_id}", json={"name": "Groceries"})
    assert resp.status_code == 200
    assert resp.get_json()["name"] == "Groceries"

    # Delete
    resp = client.delete(f"/categories/{new_id}")
    assert resp.status_code == 204


def test_transaction_flow():
    client = app.test_client()

    # Create a category
    resp = client.post("/categories", json={"name": "Bills"})
    category_id = resp.get_json()["id"]

    # Create transaction
    resp = client.post(
        "/transactions",
        json={
            "description": "Electricity",
            "amount": 50,
            "date": "2024-01-01",
            "category_id": category_id,
        },
    )
    assert resp.status_code == 201
    t_id = resp.get_json()["id"]

    # Read back
    resp = client.get(f"/transactions/{t_id}")
    assert resp.status_code == 200
    assert resp.get_json()["description"] == "Electricity"

    # Update
    resp = client.put(f"/transactions/{t_id}", json={"amount": 55})
    assert resp.status_code == 200
    assert resp.get_json()["amount"] == 55

    # Delete
    resp = client.delete(f"/transactions/{t_id}")
    assert resp.status_code == 204


def test_budget_and_recurring_item():
    client = app.test_client()

    # Budget
    resp = client.post(
        "/budgets",
        json={
            "name": "Monthly",
            "amount": 3000,
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
        },
    )
    assert resp.status_code == 201
    b_id = resp.get_json()["id"]

    resp = client.put(f"/budgets/{b_id}", json={"amount": 3500})
    assert resp.status_code == 200

    resp = client.delete(f"/budgets/{b_id}")
    assert resp.status_code == 204

    # Recurring item
    resp = client.post(
        "/recurring_items",
        json={
            "name": "Gym",
            "amount": 30,
            "frequency": "monthly",
            "next_due_date": "2024-02-01",
        },
    )
    assert resp.status_code == 201
    r_id = resp.get_json()["id"]

    resp = client.put(
        f"/recurring_items/{r_id}",
        json={"amount": 35, "next_due_date": "2024-03-01"},
    )
    assert resp.status_code == 200

    resp = client.delete(f"/recurring_items/{r_id}")
    assert resp.status_code == 204

