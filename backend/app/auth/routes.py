from flask import request, jsonify
from app.auth import auth_bp
from app.models import User
from app.extensions import bcrypt
from app import db
from flask_login import login_user, logout_user

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        login_user(user)
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200
