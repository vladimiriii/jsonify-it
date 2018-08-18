# -*- coding: utf-8 -*-
import pandas as pd
import os, shutil, re, csv
import json

import sys
if sys.version_info[0] < 3:
    from StringIO import StringIO
else:
    from io import StringIO

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
def filter_and_format(raw_df, columns=None, min_idx=None, max_idx=None, filter_col=None, filter_val=None, transpose=False):

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



        return clean_df
    except:
        return raw_df

def json_to_csv(data):

    # Convert to Dictionary
    try:
        dd = json_to_dict(data['json_data'])
    except:
        error = "JSON format does not appear to be correct."
        return error

    # Convert to DataFrame
    try:
        df = convert_to_dataframe(dd)
    except:
        error = "Could not understand data structure."
        return error

    # Unused options
    columns = None
    max_idx = None
    min_idx = None
    filter_col = None
    filter_val = None

    df = filter_and_format(df, columns=columns, min_idx=min_idx, max_idx=max_idx, filter_col=filter_col, filter_val=filter_val)

    # OUTPUT OPTIONS
    delimiter = data['sep']
    header = True
    index = False
    index_label = ""

    # Fix date columns
    date_cols = None
    date_format = "%m-%d-%Y"
    if date_cols is not None:
        for col in date_cols:
            df[col] = pd.to_datetime(df[col])

    # Wrap CSV values in quotes?
    if data['quotes'] == 'minimal':
        quotes = csv.QUOTE_MINIMAL
    elif data['quotes'] == 'non_numeric':
        quotes = csv.QUOTE_NONNUMERIC
    elif data['quotes'] == 'all':
        quotes = csv.QUOTE_ALL
    else:
        quotes = None

    # Transpose dataset?
    if data['transpose']:
        df = df.transpose()
        header = False

    # Create final csv
    output = df.to_csv(sep=delimiter, header=header, index=index, index_label=index_label, date_format=date_format, quoting=quotes)

    return output
