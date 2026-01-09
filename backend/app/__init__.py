from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from extensions import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(uid):
        return User.query.get(uid)

    bcrypt.init_app(app)

    from app.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    Migrate(app, db)

    @app.route('/')
    def index():
        return "Hello, World!"

    return app
