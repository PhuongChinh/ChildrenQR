#!/bin/bash

# Create a package for application
#------------------------------------------------------------------------------------
PROJ_DIR=`pwd`
BASE_DIR="${PROJ_DIR}/angular"

echo "Starting build..."

cd ${BASE_DIR}

ng build --prod

cd ${PROJ_DIR}

echo "Clear unused script"

echo "Build process completed"
