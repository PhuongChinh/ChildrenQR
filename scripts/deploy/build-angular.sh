#!/bin/bash

# Create a package for application
#------------------------------------------------------------------------------------
PROJ_DIR=`pwd`
ANGULAR_DIR="${PROJ_DIR}/angular"

echo "Starting build..."

cd ${ANGULAR_DIR}

ng build --prod

cd ${PROJ_DIR}

echo "Build process completed"

