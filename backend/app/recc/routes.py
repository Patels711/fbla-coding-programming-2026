from flask import request, jsonify, render_template, url_for, redirect
from . import recc_bp
from app.models import User, Review, Location
from app import db
import requests
import os

tomtom_api_key = os.getenv('TOMTOM_API_KEY')

@recc_bp.route('/nearby', methods=['POST'])
def get_nearby_recommendations():
    data = request.get_json()
    latitude = data.get('latitude', 36.98844) 
    longitude = data.get('longitude', -121.97483)
    radius_mi = data.get('radius_mi', 5)
    limit = data.get('limit', 100)

    request_url = f"https://api.tomtom.com/search/2/nearbySearch/.json?key={tomtom_api_key}&lat={latitude}&lon={longitude}&radius={radius_mi * 1609.34}&limit={limit}"

    response = requests.get(request_url)
    if response.status_code != 200:
        return jsonify({'message': 'Error fetching data from TomTom API'}), 500

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

    return jsonify({'recommendations': recommendations, 'length': len(recommendations)}), 200
