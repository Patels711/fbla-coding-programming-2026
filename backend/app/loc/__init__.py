from flask import Blueprint

loc_bp = Blueprint('loc', __name__, template_folder='templates')

from app.loc import routes
