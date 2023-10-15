import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { getStandardVpc, getSubnets } from "./utils/network";
import { Parameters } from "./utils/params";
import { ElasticContainerServiceCluster } from "./constructs/ecs-cluster";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ecs from "aws-cdk-lib/aws-ecs";

export interface ElasticContainerServiceStackProps extends cdk.StackProps {
    // properties goes here
    vpc: cdk.aws_ec2.Vpc;
}

export class ElasticContainerServiceStack extends cdk.Stack {
    public readonly ecsCluster: ecs.Cluster;
    public readonly ecsRole: iam.Role;
    public readonly ecsSecurityGroup: ec2.SecurityGroup;
    public readonly logGroup: logs.ILogGroup;

    constructor(scope: Construct, id: string, props: ElasticContainerServiceStackProps) {
        super(scope, id, props);
        // extract parameters
        const params = new Parameters();
        const application = params.application;
        const description = params.description;
        const environment = params.environment;
        const app = application.replace(/ /g, "").toLowerCase(); // machine friendly name

        // tag the stack with standard tags
        cdk.Tags.of(this).add("Application", application);
        cdk.Tags.of(this).add("Description", description);
        cdk.Tags.of(this).add("Environment", environment);

        // create the ECS infrastructure
        const ecs = new ElasticContainerServiceCluster(this, "ecs-service", {
            application: app,
            //subnet: getSubnets(this).private.privatesubnetaz1,
            vpc: props.vpc,
        });

        this.ecsCluster = ecs.ecsCluster;
        this.ecsRole = ecs.ecsRole;
        this.ecsSecurityGroup = ecs.ecsSecurityGroup;
        this.logGroup = ecs.logGroup;
    }
}
