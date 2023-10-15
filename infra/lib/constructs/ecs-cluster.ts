// import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";

export interface ElasticContainerServiceClusterProps {
    application: string;
    vpc: ec2.IVpc;
    //subnet: ec2.SubnetSelection;
}

export class ElasticContainerServiceCluster extends Construct {
    public readonly ecsCluster: ecs.Cluster;
    public readonly ecsRole: iam.Role;
    public readonly ecsSecurityGroup: ec2.SecurityGroup;
    public readonly logGroup: logs.LogGroup;
    constructor(scope: Construct, id: string, props: ElasticContainerServiceClusterProps) {
        super(scope, id);

        // create task role
        this.ecsRole = new iam.Role(scope, `ecs-role-${props.application}`, {
            roleName: `ecs-role-${props.application}`,
            assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
        });

        // grant permissions to the task role
        this.ecsRole.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: [
                    "ecr:GetAuthorizationToken",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:BatchGetImage",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                    "*",
                ],
                effect: iam.Effect.ALLOW,
                resources: ["*"],
            }),
        );

        // create the ECS cluster
        this.ecsCluster = new ecs.Cluster(scope, `ecs-cluster-${props.application}`, {
            clusterName: `ecs-cluster-${props.application}`,
            vpc: props.vpc,
        });

        // configure log group
        this.logGroup = new logs.LogGroup(scope, `ecs-log-group-${props.application}`, {
            logGroupName: `ecs-log-group-${props.application}`,
            retention: Infinity,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        // define the log
        new ecs.AwsLogDriver({
            logGroup: this.logGroup,
            streamPrefix: "ecs",
        });

        // create security group for cluster
        this.ecsSecurityGroup = new ec2.SecurityGroup(scope, `ecs-sg-${props.application}`, {
            securityGroupName: `ecs-sg-${props.application}`,
            vpc: props.vpc,
            allowAllOutbound: true,
        });
        this.ecsSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            "Allow access to port 80/http",
        );
    }
}
