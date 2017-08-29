#!/usr/bin/python
app_dir_path = '<FILEPATH>'
activate_this = '%s/venv/bin/activate_this.py' % (app_dir_path)

import sys
sys.stdout = sys.stderr
sys.path.insert(0, app_dir_path)

from run import app as application
