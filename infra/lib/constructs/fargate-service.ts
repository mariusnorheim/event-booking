import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SGIngressRules } from "../interfaces/sg-ingress-rules";
import { applySgIngressRules } from "../utils/apply-sg-rules";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface EcsFargateServiceProps {
    application: string;
    service: string;
    ecsCluster: ecs.Cluster;
    ecsSecurityGroup: ec2.SecurityGroup;
    ecsRole: iam.Role;
    loadBalancer: elb.ApplicationLoadBalancer;
    loadBalancerListener: elb.ApplicationListener;
    targetGroupBlue: elb.ApplicationTargetGroup;
    targetGroupGreen: elb.ApplicationTargetGroup;
    cpuContainer: number;
    memoryContainer: number;
    cpuScalingPercent: number;
    memoryScalingPercent: number;
    maxNumberOfContainers: number;
    minNumberOfContainers: number;
    desiredNumberOfContainers: number;
    containerPort: number;
    containerProtocol?: elb.ApplicationProtocol;
    hostPort: number;
    dockertag: string;
    dockerrepos: ecr.IRepository;
    //subnet: ec2.SubnetSelection;
    sgIngressRules?: Array<SGIngressRules>;
    environmentVars?: {
        [key: string]: string;
    };
    secretEnvironmentVars?: {
        [key: string]: cdk.aws_ecs.Secret;
    };
    healthCheckPath?: string;
    healthyHttpCodes?: string;
    assignPublicIp?: boolean;
    httpsOnContainer?: boolean;
    vpc: ec2.IVpc;
}

export class EcsFargateService extends Construct {
    public readonly taskDefinition: ecs.TaskDefinition;
    public readonly container: ecs.ContainerDefinition;
    public readonly fargateService: ecs.FargateService;
    public readonly targetGroup: elb.ApplicationTargetGroup;
    public readonly logGroup: logs.ILogGroup;

    constructor(scope: Construct, id: string, props: EcsFargateServiceProps) {
        super(scope, id);

        // set cdk resource id
        const resourceId = props.service
            ? `${props.application}-${props.service}`
            : `${props.application}`;

        // configure log group
        this.logGroup = new logs.LogGroup(this, `ecs-log-group-${resourceId}`, {
            retention: Infinity,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            logGroupName: `ecs-loggroup-${resourceId}`,
        });

        // define the log
        const log = new ecs.AwsLogDriver({
            logGroup: this.logGroup,
            streamPrefix: "ecs",
        });

        // pass all values in ingress rules array to applySgIngressRules funtion
        if (props.sgIngressRules)
            applySgIngressRules(this, props.ecsSecurityGroup, props.sgIngressRules);

        // create the task definition for the container
        this.taskDefinition = new ecs.FargateTaskDefinition(
            this,
            `ecs-task-definition-${resourceId}`,
            {
                memoryLimitMiB: props.memoryContainer,
                cpu: props.cpuContainer,
                family: props.dockertag,
                taskRole: props.ecsRole,
            },
        );

        this.container = this.taskDefinition.addContainer(`container-${resourceId}`, {
            image: ecs.ContainerImage.fromEcrRepository(props.dockerrepos),
            memoryReservationMiB: props.memoryContainer,
            logging: log,
            environment: props.environmentVars,
            secrets: props.secretEnvironmentVars,
        });

        // add portmapping on the container port
        this.container.addPortMappings({
            containerPort: props.containerPort,
            hostPort: props.hostPort,
            protocol: ecs.Protocol.TCP,
        });

        // create the fargate service with a desired number of containers
        const fargateService = new ecs.FargateService(this, `fargate-service-${resourceId}`, {
            cluster: props.ecsCluster,
            desiredCount: props.desiredNumberOfContainers,
            taskDefinition: this.taskDefinition,
            securityGroups: [props.ecsSecurityGroup],
            assignPublicIp: props.assignPublicIp ? props.assignPublicIp : false,
            //vpcSubnets: props.subnet,
            platformVersion: ecs.FargatePlatformVersion.LATEST,
            serviceName: props.service,
            enableExecuteCommand: true,
            // Sets CodeDeploy as the deployment controller
            deploymentController: {
                type: ecs.DeploymentControllerType.CODE_DEPLOY,
            },
        });

        // add scaling on the containers, max number of containers and min number of containers
        const scaling = this.fargateService.autoScaleTaskCount({
            maxCapacity: props.maxNumberOfContainers,
            minCapacity: props.minNumberOfContainers,
        });

        // add cpu scaling based on a percent
        scaling.scaleOnCpuUtilization(`cpu-scaling-${resourceId}`, {
            targetUtilizationPercent: props.cpuScalingPercent,
        });

        // add memory scaling based on a percent
        scaling.scaleOnMemoryUtilization(`memory-scaling-${resourceId}`, {
            targetUtilizationPercent: props.memoryScalingPercent,
        });

        // attach service to target group
        this.fargateService.attachToApplicationTargetGroup(props.targetGroupBlue);

        this.fargateService = fargateService;
    }
}
