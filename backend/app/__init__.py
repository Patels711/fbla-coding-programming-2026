from flask import Flask
from flask_migrate import Migrate
from flask_login import LoginManager
from app.extensions import db, bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    from app.models import User
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    bcrypt.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(uid):
        return User.query.get(uid)

    from app.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    Migrate(app, db)

    @app.route('/')
    def index():
        return "Hello, World!"

    return app
