#!/bin/bash
# Create RDS admin credentials
set -e # Exit on error
SECRET_NAME="costexplorer/postgres-admin"
PROFILE="shared-main" # AWS CLI deployment profile
ENGINE="postgres"
USERNAME="azets"
PASSWORD=$(openssl rand -base64 28 | tr -d "=+/." | cut -c1-20)
DBNAME="costapp"
PORT="5432"

# Check for files and delete if exists
if [ -e "creds-rds.json" ]; then
    $(rm -f creds-rds.json)
fi

# Create file for credentials
echo '{"engine":"'$ENGINE'","username":"'$USERNAME'","password":"'$PASSWORD'","host":"","dbname":"'$DBNAME'","port":'$PORT'}' >> creds-rds.json

# Create RDS admin secret
SECRET=$(aws secretsmanager update-secret \
--secret-id $SECRET_NAME \
--secret-string file://creds-rds.json \
--profile $PROFILE)

# Clean up
$(rm -f creds-rds.json)

echo "Success: Secret for postgres admin user was updated."
