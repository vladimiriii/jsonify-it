# -*- coding: utf-8 -*-
import pandas as pd
import os, shutil, re
import json
from flask import Blueprint, jsonify, render_template, session, redirect, url_for, current_app, request

import sys
if sys.version_info[0] < 3:
    from StringIO import StringIO
else:
    from io import StringIO

# test_json = '''{
#   "columns": [
#     "name",
#     "dep",
#     "age",
#     "sex"
#   ],
#   "index": [
#     1,
#     2,
#     3,
#     4
#   ],
#   "data": [
#     [
#       "Jane",
#       "HR",
#       24,
#       "F"
#     ],
#     [
#       "Paul",
#       "HR",
#       56,
#       "M"
#     ],
#     [
#       "Anne",
#       "Sales",
#       44,
#       "F"
#     ],
#     [
#       "John",
#       "Sales",
#       35,
#       "M"
#     ]
#   ]
# }'''

# test_json = '''[
#   {
#     "d": 1,
#     "b": 1,
#     "a": 1,
#     "c": 1
#   },
#   {
#     "d": 2,
#     "b": 2,
#     "a": 2,
#     "c": 2
#   },
#   {
#     "d": 3,
#     "b": 3,
#     "a": 3,
#     "c": 3
#   }
# ]'''

test_json = '''{
  "dep": [
    "HR",
    "HR",
    "Sales",
    "Sales"
  ],
  "name": [
    'Jane',
    "Paul"
    "Anne",
    'John'
  ]
  "age": [
    24,
    56,
    44,
    35
  ],
  "sex": [
    "F",
    "M"
    "F",
    'M'
  ],
  "dob": [
    "2001-01-03",
    "1979-11-30",
    "1965-07-01",
    "1984-08-29"
  ]
}'''



# test_json = """[
#   {
#     "children": [
#       {
#         "id": 1,
#         "dep": "HR",
#         'name': "Jane",
#         "age": 24,
#         "sex": "F"
#       },
#       {
#         "id": 2,
#         "dep": "HR",
#         "name": "Paul",
#         "age": 56,
#         "sex": "M"
#       }
#     ],
#     "name": "HR",
#     "count": 2
#   },
#   {
#     "children": [
#       {
#         "id": 3,
#         "dep": "Sales",
#         "name": "Anne",
#         "age": 44,
#         "sex": "F"
#       },
#       {
#         "id": 4,
#         "dep": "Sales",
#         "name": "John",
#         "age": 35,
#         "sex": "M"
#       }
#     ],
#     "name": "Sales",
#     "count": 2
#   }
# ]"""

# Convert from JSON to Python object
def json_to_dict(raw_json, retry=False):
    try:
        data_dict = json.loads(raw_json)
        return data_dict
    except:
        if not retry:
            # Fix single quotes if present
            if re.search(r"'.*'[:,}\]\n]", raw_json) is not None:
                raw_json = re.sub(r"'(.*)'([:,}\]\n])", r'"\1"\2', raw_json)

            # Fix missing commas
            if re.search(r'".*"[^,:\]]*".*"', raw_json) is not None:
                raw_json = re.sub(r'(".*")([^,:\]]*".*")', r'\1,\2', raw_json)

            # Fix missing commas
            if re.search(r'".*"[\n ]*[\]}]+[^,:]*".*"', raw_json) is not None:
                raw_json = re.sub(r'(".*"[\n ]*[\]}]+)([^,:]*".*")', r'\1,\2', raw_json)

            # Try to re-run
            return json_to_dict(raw_json, True)
        else:
            raise

# Convert from Dictionary to Pandas DataFrame
def convert_to_dataframe(raw_data):

    # Determine Structure
    if type(raw_data) is list:
        # RECORDS
        if len(raw_data) >= 1:
            output_df = pd.DataFrame.from_dict(raw_data)

        # EMPTY JSON
        elif len(raw_data):
            output_df = pd.DataFrame()
    elif type(raw_data) is dict:
        # SPLIT
        if all(x in raw_data.keys() for x in ['columns', 'data']):
            output_df = pd.DataFrame(raw_data['data'], columns=raw_data['columns'])

            # Check in indices provided and add
            if 'index' in raw_data.keys():
                output_df.index = raw_data['index']

        # ALL OTHER STRUCTURES
        else:
            output_df = pd.DataFrame.from_dict(raw_data)

    return output_df

# Filter DataFrame
def fiter_and_format(raw_df, columns=None, min_idx=None, max_idx=None, filter_col=None, filter_val=None, transpose=False):

    # If any step deosn't work, just return original DataFrame unchanged
    try:
        # Select appropriate columns
        if type(columns) is list and len(columns) > 0:
            clean_df = raw_df[columns].copy()
        else:
            clean_df = raw_df.copy()

        # Select indices
        if min_idx is not None:
            clean_df = clean_df.loc[clean_df.index >= min_idx]

        if max_idx is not None:
            clean_df = clean_df.loc[clean_df.index <= max_idx]

        # Apply filters
        if filter_col is not None and filter_val is not None and filter_col in clean_df.columns:
            clean_df = clean_df.loc[clean_df[filter_col] == filter_val]

        # Transpose
        if transpose:
            clean_df = clean_df.transpose()

        return clean_df
    except:
        return raw_df

def conversion_wrapper(json_string):

    # Convert to Dictionary
    try:
        dd = json_to_dict(json_string)
    except:
        error = "JSON format does not appear to be correct."
        return error

    # Convert to DataFrame
    try:
        df = convert_to_dataframe(dd)
    except:
        error = "Could not understand data structure."
        return error

    # Filter and Transform
    return df

#-----------------------------------------------
# MAIN
#-----------------------------------------------

columns = None #['dep', 'name', 'age']
transpose = False
max_idx = 3
min_idx = None
filter_col = None
filter_val = None
delimiter = '|'
header = True
index=True
index_label="Foo"
date_cols = ['dob']
date_format = "%m-%d-%Y"

df = conversion_wrapper(test_json)

if type(df) == str:
    print(df)
else:
    df = fiter_and_format(df, columns=columns, min_idx=min_idx, max_idx=max_idx, filter_col=filter_col, filter_val=filter_val, transpose=transpose)

    # Fix date columns
    if date_cols is not None:
        for col in date_cols:
            df[col] = pd.to_datetime(df[col])

    output = df.to_csv(sep=delimiter, header=header, index=index, index_label=index_label, date_format=date_format)
    print(output)
