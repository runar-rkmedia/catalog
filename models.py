"""Database-structure for item-catalog."""

# from sqlalchemy import Column, Integer, String
# from database import Base
# from flask import jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_dance.consumer.backend.sqla import (
    OAuthConsumerMixin,
)
from flask_login import (
    UserMixin,
)
import bleach
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


def verifyName(name):
    """Verify the catagory/item title."""
    if not (2 < len(name) < 30):
        raise ValueError(
            "Name should be between 2 and 30 characters")


def verifyDescription(description):
    """Verify the catagory/item title."""
    if not (3 < len(description) < 500):
        raise ValueError(
            "Description should be between 3 and 30 characters")


def verifyOwner(owner_id, this_user_id):
    """Verify that the user owns this catagory/item."""
    if not (owner_id == this_user_id):
        raise ValueError(
            "You don't have permission to edit this.")


class Catagory(db.Model):
    """Catagories-table."""
    __tablename__ = 'catagories'
    id = db.Column(db.Integer, primary_key=True, unique=True)
    name = db.Column(db.String(50))
    archived = db.Column(db.Boolean, unique=False, default=False)
    description = db.Column(db.String(500))
    created_by_user_id = db.Column(db.Integer, db.ForeignKey(User.id))
    time_created = db.Column(db.DateTime, default=db.func.now())
    user = db.relationship(User)

    @classmethod
    def get_by_id(cls, catagory_id):
        """Return a catagory-object by its id."""
        cat = Catagory.query.filter_by(id=catagory_id).first()
        if cat:
            return cat
        raise ValueError(
            "Could not find a catagory with id '{}'".format(catagory_id))

    @classmethod
    def create(cls, name, description, created_by_user_id):
        """Create a catagory."""
        verifyName(name)
        verifyDescription(description)
        cat = Catagory(
            name=bleach.clean(name),
            description=bleach.clean(description),
            created_by_user_id=created_by_user_id
        )
        db.session.add(cat)
        db.session.commit()

    @classmethod
    def edit(cls, catagory_id, name, description, created_by_user_id):
        """Create a catagory."""
        verifyName(name)
        verifyDescription(description)
        cat = Catagory.get_by_id(catagory_id)
        verifyOwner(cat.created_by_user_id, created_by_user_id)
        cat.name = name
        cat.description = description
        db.session.commit()

    @classmethod
    def delete(cls, catagory_id, created_by_user_id):
        """Delete a catagory."""
        cat = Catagory.get_by_id(catagory_id)
        verifyOwner(cat.created_by_user_id, created_by_user_id)
        cat.archived = True
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
    archived = db.Column(db.Boolean, unique=False, default=False)
    description = db.Column(db.String(500))
    created_by_user_id = db.Column(db.Integer, db.ForeignKey(User.id))
    catagory_id = db.Column(db.Integer, db.ForeignKey(Catagory.id))
    time_created = db.Column(db.DateTime, default=db.func.now())
    catagory = db.relationship(
        Catagory, primaryjoin='CatagoryItem.catagory_id==Catagory.id')
    user = db.relationship(User)

    @classmethod
    def get_by_id(cls, item_id):
        """Return a catagoryitem-object by its id."""
        item = CatagoryItem.query.filter_by(id=item_id).first()
        if item:
            return item
        raise ValueError(
            "Could not find an item with id '{}'".format(item_id))

    @classmethod
    def create(
            cls, name, description, created_by_user_id, catagory_id):
        """Create a catagory-item."""
        verifyName(name)
        verifyDescription(description)
        cat_item = CatagoryItem(
            name=bleach.clean(name),
            description=bleach.clean(description),
            created_by_user_id=created_by_user_id,
            catagory_id=catagory_id
        )
        db.session.add(cat_item)
        db.session.commit()

    @classmethod
    def edit(cls, item_id, name, description, created_by_user_id):
        """Edit an item."""
        verifyName(name)
        verifyDescription(description)
        item = CatagoryItem.get_by_id(item_id)
        verifyOwner(item.created_by_user_id, created_by_user_id)
        item.name = name
        item.description = description
        db.session.commit()

    @classmethod
    def delete(cls, item_id, created_by_user_id):
        """Delete a catagory."""
        item = CatagoryItem.get_by_id(item_id)
        verifyOwner(item.created_by_user_id, created_by_user_id)
        item.archived = True
        db.session.commit()

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        catagory = Catagory.query.filter_by(
            id=self.catagory_id).first()
        if catagory:
            catagory_name = catagory.name
        else:
            catagory_name = 'noname'
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_by_user_id': self.created_by_user_id,
            'catagory_id': self.catagory_id,
            'catagory': catagory_name,
            'time_created': self.time_created,
        }
