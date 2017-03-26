"""Database-structure for item-catalog."""

# from sqlalchemy import Column, Integer, String
# from database import Base
from flask_sqlalchemy import SQLAlchemy
from flask_dance.consumer.backend.sqla import (
    OAuthConsumerMixin,
    )
from flask_login import (
    UserMixin,
)

# setup database models
db = SQLAlchemy()


class User(db.Model, UserMixin):
    """Users-table."""
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50))
    email = db.Column(db.String(120), unique=True)
    full_name = db.Column(db.String(200))
    picture = db.Column(db.String(500))


class OAuth(db.Model, OAuthConsumerMixin):
    """Oath-table."""
    __tablename__ = 'oauth'
    user_id = db.Column(db.Integer, db.ForeignKey(User.id))
    user = db.relationship(User)


class Catagory(db.Model):
    """Catagires-table."""
    __tablename__ = 'catagories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    description = db.Column(db.String(500))
    created_by_user_id = db.Column(db.Integer, db.ForeignKey(User.id))
    time_created = db.Column(db.DateTime, default=db.func.now())
    user = db.relationship(User)

    @classmethod
    def create_catagory(cls, name, description, created_by_user_id):
        """Create a catagory."""
        if not (2 < len(name) < 30):
            raise ValueError(
                "Name should be between 2 and 30 characters")
        if not (3 < len(description) < 500):
            raise ValueError(
                "Description should be between 3 and 30 characters")
        cat = Catagory(
            name=name,
            description=description,
            created_by_user_id=created_by_user_id
        )
        db.session.add(cat)
        db.session.commit()
