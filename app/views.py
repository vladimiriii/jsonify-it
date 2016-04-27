# -*- coding: utf-8 -*-
import pandas as pd
import json
import os
from flask import Blueprint, jsonify, render_template, session, redirect, url_for, current_app, request
import app.lib.CSVtoJSON as cj

# Define the blueprint:
landing_page = Blueprint('landing_page', __name__)
output_page = Blueprint('output_page', __name__)
documentation = Blueprint('documentation', __name__)

@landing_page.route('/', methods=['GET'])
def home_page():
    return render_template('index.html')

@documentation.route('/documentation', methods=['GET'])
def doc_page():
    return render_template('documentation.html')


@output_page.route('/output', methods=['GET', 'POST'])
def output_data():
    try:
        data_req = cj.CSVtoJSON()
        data_req.load_data()
        array = data_req.generate_array()

        return pd.io.json.dumps(array)

    except:
        return "{\"Error\": \"Data could not be returned. Please check options and try again.\"}"
        
        
# @output_page.route('/api/tojson', methods=['POST'])
# def to_json():
#     return request.data