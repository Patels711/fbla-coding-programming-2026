from flask import request, jsonify, render_template, url_for, redirect
from . import recc_bp
from app.models import User, Review, Location
from app import db
from app.recc.categories import CATEGORY_MAPPING
from flask_login import login_required, current_user
import requests
import os
import unicodedata
import math

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
            'score': result.get('score'),
            'classifications': poi.get('classifications', [])
        })
    return recommendations

def get_location_vector(tomtom_poi):
    vector = {
        "food": 0.0, "activities": 0.0,
        "outdoors": 0.0, "shopping": 0.0,
        "arts_and_culture": 0.0, "museums": 0.0,
        "nightlife": 0.0, "family_friendly": 0.0,
        "proffesional_services": 0.0, "transportation_utilities": 0.0,
        "lodging_residential": 0.0, "education": 0.0,
        "business_industrial": 0.0, "religion_community": 0.0
    }

    classifications = tomtom_poi.get("classifications", [])

    for item in classifications:
        names = item.get('names', [])
        for name_obj in names:
            raw_name = name_obj.get('name', '').strip().upper()

            if raw_name in CATEGORY_MAPPING:
                mapped_val = CATEGORY_MAPPING[raw_name]

                if isinstance(mapped_val, list):
                    for cat in mapped_val:
                        if cat in vector:
                            vector[cat] = 1.0
                else:
                    if mapped_val in vector:
                        vector[mapped_val] = 1.0
            else:
                print(f"Missed: {raw_name}")
                pass

    return vector

def calculate_relevance(user_prefs, location_vector):
    all_keys = set(user_prefs.keys()).union(set(location_vector.keys()))

    dot_product = 0
    magnitude_user = 0
    magnitude_loc = 0

    for key in all_keys:
        user = user_prefs.get(key, 0.0)
        location = location_vector.get(key, 0.0)

        dot_product += user * location
        magnitude_user += user ** 2
        magnitude_loc += location ** 2

    magnitude_user = math.sqrt(magnitude_user)
    magnitude_loc = math.sqrt(magnitude_loc)

    if not magnitude_user or not magnitude_loc:
        return 0.0

    return dot_product / (magnitude_user * magnitude_loc)

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

@recc_bp.route('/test/nearby', methods=['GET'])
def test_recommendation():
    reccs = fetch_tomtom_data(36.98844, -121.97483, 5, 10)

    if reccs is None:
        return jsonify({'message': 'Test failed: API error'}), 500

    return jsonify({'recommendations': reccs, 'length': len(reccs)}), 200

@recc_bp.route('/test/location_vector', methods=['GET'])
def test_location_vector():
    data = fetch_tomtom_data(36.98844, -121.97483, 5, 100)
    
    reccs = data.get('results', []) if isinstance(data, dict) else data

    if not reccs:
        return jsonify({'message': 'No results found', 'raw_data': data}), 200

    vectors = []
    for rec in reccs:
        vector = get_location_vector(rec)
        poi_name = rec.get("name", "Unknown POI")
        vectors.append({'name': poi_name, 'vector': vector})

    return jsonify({'location_vectors': vectors}), 200

@recc_bp.route('/test/relevance', methods=['GET'])
def test_relevance():
    user_prefs = {
        "food": 1.0, "activities": 0.8,
        "outdoors": 0.5, "shopping": 0.2,
        "arts_and_culture": 0.7, "museums": 0.6,
        "nightlife": 0.4, "family_friendly": 0.9,
        "proffesional_services": 0.1, "transportation_utilities": 0.0,
        "lodging_residential": 0.3, "education": 0.2,
        "business_industrial": 0.0, "religion_community": 0.5
    }

    data = fetch_tomtom_data(36.98844, -121.97483, 5, 100)

    reccs = data.get('results', []) if isinstance(data, dict) else data

    if not reccs:
        return jsonify({'message': 'No results found', 'raw_data': data}), 200

    relevances = []
    for rec in reccs:
        location_vector = get_location_vector(rec)
        relevance_score = calculate_relevance(user_prefs, location_vector)
        poi_name = rec.get("name", "Unknown POI")
        relevances.append({'name': poi_name, 'relevance_score': relevance_score})

    return jsonify({'relevance_scores': relevances}), 200
