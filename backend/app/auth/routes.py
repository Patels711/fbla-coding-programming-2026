from flask import request, jsonify, render_template, url_for, redirect
from . import auth_bp
from app.models import User
from app.extensions import bcrypt
from app import db
from flask_login import login_user, logout_user, current_user, login_required

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if User.query.filter_by(username=username).first():
            return jsonify({'message': 'Username already exists'}), 400

        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, password_hash=password_hash)
        db.session.add(new_user)
        db.session.commit()

        login_user(new_user)

        return jsonify({'message': 'Account created successfully'}), 201

    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password_hash, password):
            login_user(user)
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'message': 'Invalid username or password'}), 401

    return render_template('login.html')

@auth_bp.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

@auth_bp.route('/dashboard', methods=['GET'])
@login_required
def profile():
    return jsonify({
        'uid': current_user.uid,
        'username': current_user.username
    }), 200
