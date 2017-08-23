#! /usr/bin/env bash

# check python version, should be over 3.5.2
ret=`python3 -c 'import sys; print("%i" % (sys.hexversion<0x03050200))'`
if [ $ret -eq 0 ]; then
    echo "Required version of Python already installed."

else
    echo "You need to install Python 3.5.2"
    echo -e "Install Python 3.5.2? [y/n] \c "
    read word
    if [ $word == "y" ]; then
       if [ "$(whoami)" != "root" ]; then
          echo "You need root access"
          exit 1
       fi
       # echo "You said yes"
       echo `wget https://www.python.org/ftp/python/3.5.2/Python-3.5.2.tgz --no-check-certificate`
       echo `tar xf Python-3.5.2.tgz`
       cd Python-3.5.2
       echo `./configure --prefix=/usr/local`
       echo `make && make altinstall`
       echo `rm Python-3.5.2.tgz`
     else
       echo "Aborting installation script."
       exit 1
    fi
fi

echo "Testing whether virtualenv is installed..."
# test whether virtualenv is installed
ve=`command -v virtualenv`
if [ -z "$ve" ]; then
   echo "You need to install virtualenv?"
   echo -e "Install virtualenv? [y/n] \c "
   read word
   if [ $word == "y" ]; then
      echo "This will install virtualenv in your home directory"
      if [ "$(whoami)" != "root" ]; then
         echo "You need root access"
         exit 1
      fi
      echo "Installing virtualenv..."
      currdir=`pwd`
      cd $HOME
      echo `curl -O https://pypi.python.org/packages/d4/0c/9840c08189e030873387a73b90ada981885010dd9aea134d6de30cd24cb8/virtualenv-15.1.0.tar.gz#md5=44e19f4134906fe2d75124427dc9b716`
      echo `tar xvfz virtualenv-15.1.0.tar.gz`
      cd virtualenv-15.1.0
      echo `python setup.py install`
      cd $currdir
   fi
fi
# start virtual env and install flask
echo `virtualenv -p python3 venv`
currentDir=`pwd`
virtualenvPath='venv/bin/activate'
source $currentDir/$virtualenvPath

pip install -r requirements.txt
echo "Installation complete."
