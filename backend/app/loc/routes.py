from flask import request, jsonify, render_template, url_for, redirect
from . import loc_bp 
from app.models import User
from app import db

@loc_bp.route('/loc/<int:location_id>', methods=['GET'])
def get_location_details(location_id):
    from app.models import Location
    location = Location.query.get(location_id)
    if not location:
        return jsonify({'message': 'Location not found'}), 404

    location_data = {
        'id': location.id,
        'name': location.name,
        'address': location.address,
        'description': location.description
    }

    return jsonify(location_data), 200

@loc_bp.route('/loc/all', methods=['GET'])
def get_all_locations():
    from app.models import Location
    locations = Location.query.all()
    locations_data = []
    for location in locations:
        locations_data.append({
            'id': location.id,
            'name': location.name,
            'address': location.address,
            'description': location.description
        })

    return jsonify(locations_data), 200

@loc_bp.route('/loc/add', methods=['POST'])
def add_location():
    from app.models import Location
    data = request.get_json()
    name = data.get('name')
    address = data.get('address')
    description = data.get('description', '')

    new_location = Location(name=name, address=address, description=description)
    db.session.add(new_location)
    db.session.commit()

    return jsonify({'message': 'Location added successfully', 'location_id': new_location.id}), 201
