from sqlalchemy import Column, Integer, String
from database import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    email = Column(String(120), unique=True)
    full_name = Column(String(200), unique=True)
    picture = Column(String(500))

    def __init__(self, username=None, email=None, full_name=None, picture=None):
        self.username = username
        self.email = email
        self.picture = picture
        self.full_name = full_name

    def __repr__(self):
        return '<User %r>' % (self.name)
