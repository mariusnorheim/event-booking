Infrastructure for Ticket application

- ALB
- ECS cluster
- ECS fargate service
- Postgres RDS
- Cognito

First time deployment:

Run the update rds secret script in utils folder after the utility stack has been created. The postgres instance needs a updated secret to deploy correctly. The cognito secret needs the cognito stack to be deployed before being updated. The connection secret needs both the utility stack and the RDS stack to have been created for the values to be correct.

All of the secrets are used as app critical env variables in the service container - so if it fails to spin up, make sure the secrets are updated with correct values. If you miss any of these steps at deployment time, delete only the stack that failed creation and redeploy after secret has been updated in Secrets Manager

This stack will create a ECR repo, make sure to also trigger a docker build process after the utility stack has been created so the service can fetch the app from the ECR repo
