from app.extensions import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    profile_picture = db.Column(db.String(256), nullable=True)

    def get_id(self):
        return str(self.uid)

    def __repr__(self):
        return f'<User {self.username}>'
