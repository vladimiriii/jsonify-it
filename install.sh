#! /usr/bin/env bash
echo "Setting up virtual environment..."
echo `python3 -m venv venv`
currentDir=`pwd`
virtualenvPath='venv/bin/activate'
source $currentDir/$virtualenvPath

echo "Installing requirements..."
pip3 install -r requirements.txt
sed -r 's/SERVER_PORT =/SERVER_PORT = 5000/' config-template.cfg > config.cfg
echo "Installation complete."
