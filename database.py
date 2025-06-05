from flask_sqlalchemy import SQLAlchemy

# SQLAlchemy instance used across the app

db = SQLAlchemy()


def init_db(app):
    """Initialize the database with the Flask app."""
    db.init_app(app)
    with app.app_context():
        db.create_all()
        # ensure an uncategorized default exists
        from models import Category
        if not Category.query.get(1):
            db.session.add(Category(id=1, name="Uncategorized"))
            db.session.commit()
