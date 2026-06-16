#!/bin/bash

echo "Cleaning individual log files..."

cd ~/Documents/Projects/TestingProjects/nodejspostgre/src/logs/log_files/individualfiles || exit
rm -rf *

echo "Resetting main log files..."

cd ~/Documents/Projects/TestingProjects/nodejspostgre || exit

echo "" > src/logs/log_files/1logs_fail.txt
echo "" > src/logs/log_files/1logs_request.txt
echo "" > src/logs/log_files/1logs_select_query.sql
echo "" > src/logs/log_files/1logs_insert_query.sql
echo "" > src/logs/log_files/1logs_success.txt

echo "Git add..."
git add .

#read -p "Enter commit message: " msg
#git commit -m "$msg"
git commit -m "Updates $(date '+%Y-%m-%d %H:%M:%S')"

echo "Git push..."
git push origin main

echo "Deployment completed successfully."
