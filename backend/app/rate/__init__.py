from flask import Blueprint

rate_bp = Blueprint('rate', __name__, template_folder='templates')

from app.rate import routes
