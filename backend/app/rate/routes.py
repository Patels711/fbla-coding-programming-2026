from flask import request, jsonify, render_template, url_for, redirect
from . import rate_bp
from app.models import User
from app import db

@rate_bp.route('/test', methods=['GET'])
def test_route():
    return jsonify({'message': 'Rate blueprint is working!'}), 200
