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
