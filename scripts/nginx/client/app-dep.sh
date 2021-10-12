#!/bin/bash
APP_ARCHIVED_FILE="/tmp/smg-web.tar.gz"
DEP_DIR="/usr/share/nginx/stage/smg"

CUDIR=`pwd`

#npm i;
echo "Clear old app files"
sudo rm -rf "${DEP_DIR}/*"
sudo mkdir -p "${DEP_DIR}"

echo "Extract files"
# Extract app to install dir
sudo mkdir -p "${DEP_DIR}" && tar --strip-components 2 -xzf "${APP_ARCHIVED_FILE}" -C "${DEP_DIR}"

#sudo chown -R centos:centos "${DEP_DIR}";
sudo chmod -R 755 "${DEP_DIR}";

echo "Check file size"
du -sh "${DEP_DIR}/"

du -sh "${DEP_DIR}/assets/"


echo "Clear cached and restart server"
sudo rm -rf /var/cache/nginx/*

sudo systemctl restart nginx

echo "Done";
