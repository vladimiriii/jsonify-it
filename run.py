#!/usr/local/bin/python3.1
import pandas as pd
import argparse
import json
from flask import Flask, jsonify, request
import os

# Example query strings: 
# ?file_name=procurement_data&file_type=csv&group_by=2&root_node=Procurement%20Data&sum_field=value&avg_field=overun_%&limit=10
# ?file_name=procurement_data&file_type=csv&group_by=2&Data&limit=10&filter_col=Year%filter_val=2014
# ?file_name=procurement_data&file_type=csv&Data&limit=100&colnames=Fund%20Source,Municipality,Year

#-------------------------------------------
# Routes
#-------------------------------------------
app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    intro = "<h1>Welcome to the CSV data API!</h1>"
    intro = intro + "<p>The parameters that can be passed in the URL are as follows:<br><ul>"
    intro = intro + "<li>file_name - The name of the file (minus file type).</li>"
    intro = intro + "<li>file_type - The file extemsion (only csv is currently handled).</li>"
    intro = intro + "<li>group_by - [Optional] The number of levels to nest. Will assume columns are in correct order.</li>"
    intro = intro + "<li>colnames - [Optional] A comma seperated list of columns to nest by. Will override group_by if provided.</li>"
    intro = intro + "<li>filter_col - [Optional] The name of a column to filter the dataset on.</li>"
    intro = intro + "<li>filter_val - [Optional] The value to look for in filter_col.</li>"
    intro = intro + "<li>limit - [Optional] Limit the output to this many rows. 0 by default.</li>"
    intro = intro + "<li>root_node - [Optional] Name of the root node in the JSON. Default is 'data'.</li>"
    intro = intro + "<li>name_field - [Optional] The name of the key that stores the nested value at each level. Default is 'name'.</li>"
    intro = intro + "<li>sum_field - [Optional] The column to sum at each level.</li>"
    intro = intro + "<li>avg_field - [Optional] The column to average at each level.</li>"
                        
    intro = intro + "</ul>Only the file_name and file_type fields are mandatory.</p>"
    return intro

@app.route('/output', methods=['GET'])
def data():
    try:
        file_name = request.args.get('file_name')
        file_type = request.args.get('file_type', "csv")
        group_by = int(request.args.get('group_by', 0))
        colnames = request.args.get('colnames', None)
        filter_col = request.args.get('filter_col', None)
        filter_val = request.args.get('filter_val', None)
        limit = request.args.get('limit', None)
        root_node = request.args.get('root_node', "Data")
        name_field = request.args.get('name_field', "name")
        child_field = request.args.get('child_field', "children")
        sum_field = request.args.get('sum_field', None)
        avg_field = request.args.get('avg_field', None)
    
        # Initialize field names
        current_level = 1
        APP_ROOT = os.path.dirname(os.path.abspath(__file__))
        APP_STATIC = os.path.join(APP_ROOT, 'data')
        file_n = file_name + "." + file_type
        filepath = os.path.join(APP_STATIC, file_n)
        
        #filepath = "data/" + file_name + "." + file_type
    
        # Load in csv Dataset
        if file_type == "csv":
            data = pd.read_csv(filepath, header=0, delimiter=",", quoting=1, index_col=0)

        if filter_col is not None and filter_val is not None:
            data = data.loc[data.loc[ : , filter_col].astype(str) == str(filter_val), : ]
        
        if limit is not None:
            data = data[ :int(limit)]

        if avg_field is not None:
            root_avg = data.loc[ : , avg_field].mean()

            # Check if column names were passed and use if able
        if colnames is None:
            total_levels = group_by
            col_names = None
        else: 
            col_names = colnames.split(',')
            total_levels = len(col_names)
    
        # Handle no nesting scenario
        if total_levels == 0:
            array = {name_field: root_node
                    , child_field : data.to_dict(orient = "records")}
        else:
            #Initialize Array
            array = {name_field: root_node
                    , child_field : []
                    }   

            # Begin Recursion
            array = inner_loop(data = data
                , array = array
                , current_level = current_level
                , total_levels  = total_levels
                , nest_cols = col_names
                , name = name_field
                , children = child_field
                , sum_value = sum_field
                , avg_value = avg_field
            )
        
        return jsonify(**array)
        
    except:
        return "<h2>Error</h2><p>Data could not be returned. Please check query and try again.</p>"

#-------------------------------------------
# Recursive Function
#-------------------------------------------
def inner_loop(data, array, current_level, total_levels, nest_cols, name, children, sum_value, avg_value, count_field = True):
    
    #Extract column name
    if nest_cols == None:
        colname = list(data.columns.values)[(current_level - 1)]
    else:
        colname = nest_cols[current_level - 1]   
    
    # Extract Levels for Current Column
    levels = data[colname].drop_duplicates().values.tolist()
    
    #Loop through levels
    i = 0
    for level in levels:
        
        # Create empty children subarray
        array[children].insert(i, {})
        array[children][i][children] = {}
        
        # If further nesting required
        if current_level < total_levels:
            new_level = current_level + 1
            subdata = data.loc[data.loc[ : , colname] == level, : ]
            new_array = {children : []}
            subarray = inner_loop(subdata, new_array, new_level, total_levels, nest_cols, name, children, sum_value, avg_value, count_field)
            array[children][i] = subarray
            
        # Else if all nesting completed
        elif current_level == total_levels:
            other_values = data.loc[data.loc[ : , colname] == level, : ].to_dict(orient = "records")
            array[children][i][children] = other_values
        
        # Add Meta Values for current Level
        array[children][i][name] = level
        if sum_value != None:
            array[children][i][sum_value] = data.loc[data.loc[ : , colname] == level, sum_value].sum()
        if avg_value != None:
            array[children][i][avg_value] = data.loc[data.loc[ : , colname] == level, avg_value].mean()
        if count_field:
            array[children][i]["count"] = len(data.loc[data.loc[ : , colname] == level, ].index)
        
        i += 1
    
    return array


#-------------------------------------------
# Run the App
#-------------------------------------------
if __name__ == '__main__':
    
    # Define the arguments.
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to: [%(default)s].')
    parser.add_argument('--port', type=int, default=app.config['SERVER_PORT'], help='Port to listen to: [%(default)s].')
    parser.add_argument('--debug', action='store_true', default=False, help='Debug mode: [%(default)s].')

    # Parse arguemnts and run the app.
    args = parser.parse_args()
    app.run(debug=args.debug, host=args.host, port=args.port)

