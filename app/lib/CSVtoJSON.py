# -*- coding: utf-8 -*-
import pandas as pd
import os
from flask import request

import sys
if sys.version_info[0] < 3:
    from StringIO import StringIO
else:
    from io import StringIO


# -------------------------------------------
# Recursive Function
# -------------------------------------------
def inner_loop(data, array, current_level, total_levels, nest_cols, name, children, sum_col, sum_col_name, avg_col, avg_col_name, base_structure, count_field=True):

    # Extract column name
    if nest_cols is None:
        colname = list(data.columns.values)[(current_level - 1)]
    else:
        colname = nest_cols[current_level - 1]

    # Extract Levels for Current Column
    levels = data[colname].drop_duplicates().values.tolist()

    # Loop through levels
    i = 0

    for level in levels:

        # Create empty children subarray
        array[children].insert(i, {})
        array[children][i][children] = {}

        # If further nesting required
        if current_level < total_levels:
            new_level = current_level + 1
            subdata = data.loc[data[colname] == level, : ]
            new_array = {children: []}
            subarray = inner_loop(subdata, new_array, new_level, total_levels, nest_cols, name, children, sum_col, sum_col_name, avg_col, avg_col_name, base_structure, count_field)
            array[children][i] = subarray

        # Else if all nesting completed
        elif current_level == total_levels:
            other_values = data.loc[data[colname] == level, :].to_dict(orient=base_structure)
            array[children][i][children] = other_values

        # Add Meta Values for current Level
        array[children][i][name] = level
        if sum_col is not None:
            array[children][i][sum_col_name] = data.loc[data[colname] == level, sum_col].sum()
        if avg_col is not None:
            array[children][i][avg_col_name] = data.loc[data.loc[:, colname] == level, avg_col].mean()
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
        self.col_names = request.args.get('col_names', None)
        self.filter_col = request.args.get('filter_col', None)
        self.filter_val = request.args.get('filter_val', None)
        self.limit = request.args.get('limit', None)
        self.root_node = request.args.get('root_node', "Data")
        self.name_key = request.args.get('name_key', "name")
        self.child_key = request.args.get('child_key', "children")
        self.sum_field = request.args.get('sum_field', None)
        self.sum_field_name = request.args.get('sum_field_name', "sum")
        self.avg_field = request.args.get('avg_field', None)
        self.avg_field_name = request.args.get('avg_field_name', "average")
        self.base_structure = request.args.get('base_structure', "records")
        self.file_or_input = request.args.get('file_or_input', 'file')

        # Handle Tab separated files
        if self.csv_sep == "tab":
            self.csv_sep = "\t"

        # Handle Boolean parameters
        if request.args.get('header_sel', 'true') == 'true':
            self.header_sel = 0
        else:
            self.header_sel = None

        if request.args.get('wrapper', False) == 'true':
            self.wrapper = True
        else:
            self.wrapper = False

        if request.args.get('preview', False) == 'true':
            self.preview = True
        else:
            self.preview = False

    def load_data(self):

        if self.file_or_input == "file":
            # Get filepath
            APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            APP_STATIC = os.path.join(APP_ROOT, 'data')
            file_n = self.file_name + ".csv"
            self.filepath = os.path.join(APP_STATIC, file_n)

            # Load in csv Dataset
            self.data = pd.read_csv(self.filepath, header=self.header_sel, delimiter=self.csv_sep, quoting=0, index_col=None)

        elif self.file_or_input == "input":
            input_data = StringIO(request.form['data'])
            self.data = pd.read_csv(input_data, header=self.header_sel, sep=self.csv_sep, index_col=None, encoding='utf-8')

        # Apply filters
        if self.filter_col is not None and self.filter_val is not None:
            self.data = self.data.loc[self.data.loc[:, self.filter_col].astype(str) == str(self.filter_val), :]

        # Apply specified row limit
        if self.limit is not None:
            self.data = self.data[:int(self.limit)]

        # Set index according to selected value
        if self.index_col is not None:

            # Handle No Header Scenario
            if self.header_sel is None:
                self.index_col = int(self.index_col)

            self.data.set_index(self.index_col, inplace=True)

        # Get only first 10 rows if preview
        if self.preview:
            self.data = self.data.iloc[0:10, :]

        # Check if column names were passed and use if able
        if self.col_names is not None:
            self.col_names = self.col_names.split(',')
            self.total_levels = len(self.col_names)
        else:
            self.total_levels = 0

    def generate_array(self):

        self.data = self.data.astype(object)

        # Handle no nesting scenario
        if self.total_levels == 0:
            array = self.data.to_dict(orient=self.base_structure)
        else:
            # Initialize Array
            array = {self.child_key: []}

            # Begin Recursion
            current_level = 1
            array = inner_loop(
                data=self.data
                , array=array
                , current_level=current_level
                , total_levels=self.total_levels
                , nest_cols=self.col_names
                , name=self.name_key
                , children=self.child_key
                , sum_col=self.sum_field
                , sum_col_name=self.sum_field_name
                , avg_col=self.avg_field
                , avg_col_name=self.avg_field_name
                , base_structure=self.base_structure
            )

            # Remove outer layer
            array = array[self.child_key]

        if self.wrapper:
            array = {self.name_key: self.root_node, self.child_key: array}

        return array
