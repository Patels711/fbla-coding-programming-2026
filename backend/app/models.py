from app.extensions import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    profile_picture = db.Column(db.String(256), nullable=True)
    reviews = db.relationship('Review', back_populates='user', lazy=True)

    def get_id(self):
        return str(self.uid)

    def __repr__(self):
        return f'<User {self.username}>'

class Review(db.Model):
    rid = db.Column(db.Integer, primary_key=True)
    star_rating = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.uid'), nullable=False)
    user = db.relationship('User', back_populates='reviews', lazy=True)

    def __repr__(self):
        return f'<Review {self.id} by User {self.user_id}>'
