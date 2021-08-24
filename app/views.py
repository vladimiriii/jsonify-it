# -*- coding: utf-8 -*-
import json
import simplejson
from flask import Blueprint, jsonify, render_template, request
import app.lib.CSVtoJSON as cj
from app.lib.JSONtoCSV import json_to_csv


# Define the blueprint:
landing_page = Blueprint('landing_page', __name__)
output_page = Blueprint('output_page', __name__)
documentation = Blueprint('documentation', __name__)


@landing_page.route('/', methods=['GET'])
def home_page():
    return render_template('index.html')


@landing_page.route('/json-to-csv', methods=['GET'])
def json_to_csv_page():
    return render_template('json-to-csv.html')


@documentation.route('/documentation', methods=['GET'])
def doc_page():
    return render_template('documentation.html')


@documentation.route('/csv-to-json-examples', methods=['GET'])
def examples_page():
    return render_template('csv-to-json-examples.html')


@output_page.route('/output', methods=['GET', 'POST'])
def output_data():
    try:
        data_req = cj.CSVtoJSON()
        data_req.load_data()
        array = data_req.generate_array()
        return simplejson.dumps(array, ignore_nan=True)
    except:
        return "{\"Error\": \"Data could not be returned. Please check options and try again.\"}"


@output_page.route('/process-json-to-csv', methods=['POST'])
def process_json():
    try:
        input = json.loads(request.data.decode('utf-8'))
        output = json_to_csv(input)
        return jsonify(output)

    except:
        return "{\"Error\": \"Data could not be returned. Please check options and try again.\"}"
