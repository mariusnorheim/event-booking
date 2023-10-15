#!/bin/bash
# Create connection string in correct format for application
set -e # Exit on error
SECRET_NAME="costexplorer/connection"
FETCH_SECRET="costexplorer/postgres-admin"
PROFILE="shared-main" # AWS CLI deployment profile
ENGINE=$(aws secretsmanager get-secret-value --secret-id $FETCH_SECRET --query SecretString --output text --profile $PROFILE | jq .engine | tr -d \")
USERNAME=$(aws secretsmanager get-secret-value --secret-id $FETCH_SECRET --query SecretString --output text --profile $PROFILE | jq .username | tr -d \")
PASSWORD=$(aws secretsmanager get-secret-value --secret-id $FETCH_SECRET --query SecretString --output text --profile $PROFILE | jq .password | tr -d \")
HOST=$(aws secretsmanager get-secret-value --secret-id $FETCH_SECRET --query SecretString --output text --profile $PROFILE | jq .host | tr -d \")
DBNAME=$(aws secretsmanager get-secret-value --secret-id $FETCH_SECRET --query SecretString --output text --profile $PROFILE | jq .dbname | tr -d \")
PORT=$(aws secretsmanager get-secret-value --secret-id $FETCH_SECRET --query SecretString --output text --profile $PROFILE | jq .port | tr -d \")

# Check for files and delete if exists
if [ -e "creds-connection.json" ]; then
    $(rm -f creds-connection.json)
fi

# Create file for credentials
STRING=$ENGINE"://"$USERNAME":"$PASSWORD"@"$HOST":"$PORT"/"$DBNAME"?schema=public"
echo '{"DATABASE_URL":"'$STRING'"}' >> creds-connection.json

# Create connection string secret
SECRET=$(aws secretsmanager update-secret \
--secret-id $SECRET_NAME \
--secret-string file://creds-connection.json \
--profile $PROFILE)

# Clean up
$(rm -f creds-connection.json)

echo "Success: Secret for database connection string was updated."
