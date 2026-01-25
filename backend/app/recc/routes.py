from flask import request, jsonify, render_template, url_for, redirect
from . import recc_bp
from app.models import User, Review, Location
from app import db
import requests
import os

tomtom_api_key = os.getenv('TOMTOM_API_KEY')

def fetch_tomtom_data(latitude, longitude, radius_mi=5, limit=100):
    radius_meters = radius_mi * 1609.34
    request_url = f"https://api.tomtom.com/search/2/nearbySearch/.json?key={tomtom_api_key}&lat={latitude}&lon={longitude}&radius={radius_meters}&limit={limit}"
    
    response = requests.get(request_url)
    if response.status_code != 200:
        return None

    results = response.json().get('results', [])
    recommendations = []
    for result in results:
        poi = result.get('poi', {})
        position = result.get('position', {})
        recommendations.append({
            'name': poi.get('name'),
            'address': result.get('address', {}).get('freeformAddress'),
            'latitude': position.get('lat'),
            'longitude': position.get('lon'),
            'distance_meters': result.get('dist'),
            'category': poi.get('categories', []),
            'score': result.get('score')
        })
    return recommendations

@recc_bp.route('/nearby', methods=['POST'])
def get_nearby_recommendations():
    data = request.get_json() or {}
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    radius = data.get('radius_mi', 5)
    limit = data.get('limit', 100)

    reccs = fetch_tomtom_data(latitude, longitude, radius, limit)

    if reccs is None:
        return jsonify({'message': 'Error fetching data from TomTom API'}), 500

    return jsonify({'recommendations': reccs, 'length': len(reccs)}), 200

@recc_bp.route('/test', methods=['GET'])
def test_recommendation():
    reccs = fetch_tomtom_data(36.98844, -121.97483, 5, 10)

    if reccs is None:
        return jsonify({'message': 'Test failed: API error'}), 500

    return jsonify({'recommendations': reccs, 'length': len(reccs)}), 200
