#!/usr/local/bin/python2.7
# -*- coding: utf-8 -*-
import pandas as pd
import os, shutil
import json
from flask import Blueprint, jsonify, render_template, session, redirect, url_for, current_app, request

import sys
if sys.version_info[0] < 3:
    from StringIO import StringIO
else:
    from io import StringIO

#-------------------------------------------
# Recursive Function
#-------------------------------------------
def inner_loop(data, array, current_level, total_levels, nest_cols, name, children, sum_col, sum_col_name, avg_col, avg_col_name, base_structure, count_field = True):

    #Extract column name
    if nest_cols is None:
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
            subdata = data.loc[data[colname] == level, : ]
            new_array = {children : []}
            subarray = inner_loop(subdata, new_array, new_level, total_levels, nest_cols, name, children, sum_value, avg_value, base_structure, count_field)
            array[children][i] = subarray

        # Else if all nesting completed
        elif current_level == total_levels:
            other_values = data.loc[data[colname] == level, : ].to_dict(orient = base_structure)
            array[children][i][children] = other_values
        
        # Add Meta Values for current Level
        array[children][i][name] = level
        if sum_col is not None:
            array[children][i][sum_col_name] = data.loc[data[colname] == level, sum_col].sum()
        if avg_col is not None:
            array[children][i][avg_col_name] = data.loc[data.loc[:,colname] == level, avg_col].mean()
        if count_field:
            array[children][i]["count"] = len(data.loc[data[colname] == level, ].index)

        i += 1

    return array

class CSVtoJSON:
    def __init__(self):
        
        # Get arguments
        self.csv_sep = request.args.get('csv_sep', ",")
        self.index_col = request.args.get('index_col', None)
        self.file_name = request.args.get('file_name')
        self.group_by = request.args.get('group_by', None)
        self.filter_col = request.args.get('filter_col', None)
        self.filter_val = request.args.get('filter_val', None)
        self.limit = request.args.get('limit', None)
        self.root_node = request.args.get('root_node', "Data")
        self.name_field = request.args.get('name_field', "name")
        self.child_field = request.args.get('child_field', "children")
        self.sum_field = request.args.get('sum_field', None)
        self.sum_field_name = request.args.get('sum_field_name', None)
        self.avg_field = request.args.get('avg_field', None)
        self.avg_field_name = request.args.get('avg_field_name', None)
        self.base_structure = request.args.get('base_structure', "records")
        self.preview = request.args.get('preview', False)
        self.file_or_input = request.args.get('file_or_input', 'file')
        
    def load_data(self):
        
        if self.file_or_input == "file":
            # Get filepath
            APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            APP_STATIC = os.path.join(APP_ROOT, 'data')
            file_n = self.file_name + ".csv"
            self.filepath = os.path.join(APP_STATIC, file_n)
            
            # Load in csv Dataset
            self.data = pd.read_csv(self.filepath, header=0, delimiter=self.csv_sep, quoting=0, index_col=self.index_col)
            
        elif self.file_or_input == "input":
            input_data = StringIO(request.form['data'])
            self.data = pd.DataFrame.from_csv(path = input_data, header=0, sep=self.csv_sep, index_col=self.index_col, encoding='utf-8')
            
        if self.filter_col is not None and self.filter_val is not None:
            self.data = self.data.loc[self.data.loc[ : , self.filter_col].astype(str) == str(self.filter_val), : ]

        if self.limit is not None:
            self.data = self.data[ :int(self.limit)]
            
        if self.preview:
            self.data = self.data[ :10]
        
        # Check if column names were passed and use if able
        if self.group_by is not None:
            self.group_by = self.group_by.split(',')
            self.total_levels = len(self.group_by)
        else:
            self.total_levels = 0
        
    def generate_array(self):
        
        self.data = self.data.astype(object)
        
        # Handle no nesting scenario
        if self.total_levels == 0:
            #array = {self.name_field: self.root_node
            #        , self.child_field : self.data.to_dict(orient = self.base_structure)}
            array = self.data.to_dict(orient = self.base_structure)
        else:
            #Initialize Array
            array = {self.name_field: self.root_node
                    , self.child_field : []
                    }
                    
            # Begin Recursion
            current_level = 1
            array = inner_loop(data = self.data
                , array = array
                , current_level = current_level
                , total_levels  = self.total_levels
                , nest_cols = self.group_by
                , name = self.name_field
                , children = self.child_field
                , sum_col = self.sum_field
                , sum_col_name = self.sum_field_name
                , avg_col = self.avg_field
                , avg_col_name = self.avg_field_name
                , base_structure = self.base_structure
            )
        return array