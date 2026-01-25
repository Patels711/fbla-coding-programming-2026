from flask import request, jsonify, render_template, url_for, redirect
from . import recc_bp
from app.models import User, Review, Location
from app import db

@recc_bp.route('/test', methods=['GET'])
def test_recommendation():
    return jsonify({'message': 'Recommendation route is working!'}), 200
