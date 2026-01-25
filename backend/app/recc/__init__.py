from flask import Blueprint

recc_bp = Blueprint('recc', __name__, template_folder='templates')

from app.recc import routes
