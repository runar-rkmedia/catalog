"""Database-structure for item-catalog."""

# from sqlalchemy import Column, Integer, String
# from database import Base
from flask import jsonify
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

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_by_user_id': self.created_by_user_id,
        }


class CatagoryItem(db.Model):
    """Catagory-items-table."""
    __tablename__ = 'catagory-items'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    description = db.Column(db.String(500))
    created_by_user_id = db.Column(db.Integer, db.ForeignKey(User.id))
    catagory_id = db.Column(db.Integer, db.ForeignKey(Catagory.id))
    time_created = db.Column(db.DateTime, default=db.func.now())
    catagory = db.relationship(Catagory)
    user = db.relationship(User)

    @classmethod
    def create_catagory_item(
            cls, name, description, created_by_user_id, catagory_id):
        """Create a catagory-item."""
        if not (2 < len(name) < 30):
            raise ValueError(
                "Name should be between 2 and 30 characters")
        if not (3 < len(description) < 500):
            raise ValueError(
                "Description should be between 3 and 30 characters")
        cat_item = CatagoryItem(
            name=name,
            description=description,
            created_by_user_id=created_by_user_id,
            catagory_id=catagory_id
        )
        db.session.add(cat_item)
        db.session.commit()

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_by_user_id': self.created_by_user_id,
            'catagory': self.catagory_id,
        }
