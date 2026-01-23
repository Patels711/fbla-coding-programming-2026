from flask import request, jsonify, render_template, url_for, redirect
from . import loc_bp 
from app.models import User
from app import db

@loc_bp.route('/test', methods=['GET'])
def test_loc():
    return jsonify({'message': 'Location blueprint is working!'}), 200
