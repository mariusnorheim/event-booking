import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { getStandardVpc, getSubnets } from "../utils/network";
import { Parameters } from "../utils/params";
import { SGIngressRules } from "../interfaces/sg-ingress-rules";
import { ContainerRepository } from "../constructs/container-repository";
import { Secrets } from "../constructs/secrets";
import { EcsFargateService } from "../constructs/fargate-service";
import { PublicDnsRecord } from "../constructs/public-dns-record";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

export interface TicketServiceStackProps extends cdk.StackProps {
    ecsCluster: cdk.aws_ecs.Cluster;
    ecsSecurityGroup: cdk.aws_ec2.SecurityGroup;
    ecsRole: cdk.aws_iam.Role;
    loadBalancer: cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer;
    loadBalancerListener: cdk.aws_elasticloadbalancingv2.ApplicationListener;
    targetGroupBlue: cdk.aws_elasticloadbalancingv2.ApplicationTargetGroup;
    targetGroupGreen: cdk.aws_elasticloadbalancingv2.ApplicationTargetGroup;
    //secureListener: cdk.aws_elasticloadbalancingv2.ApplicationListener;
    //ecrRepo: cdk.aws_ecr.Repository
    vpc: cdk.aws_ec2.Vpc;
}

export class TicketServiceStack extends cdk.Stack {
    public readonly fargateService: cdk.aws_ecs.FargateService;
    public readonly fargateTaskDef: cdk.aws_ecs.TaskDefinition;
    
    constructor(scope: Construct, id: string, props: TicketServiceStackProps) {
        super(scope, id, props);

        // extract parameters
        const params = new Parameters();
        const service = "tickets";
        const application = params.application;
        const description = params.description;
        const environment = params.environment;
        const app = application.replace(/ /g, "").toLowerCase(); // machine friendly name

        // tag the stack
        cdk.Tags.of(this).add("Application", application);
        cdk.Tags.of(this).add("Service", service);
        cdk.Tags.of(this).add("Description", description);
        cdk.Tags.of(this).add("Environment", environment);

        // service parameters
        const serviceRepository = params.ticketServiceContainerRepository;
        const containerPort = params.ticketServiceContainerPort;
        const serviceCpu = params.ticketServiceCpu;
        const serviceCpuScalingPercent = params.ticketServiceCpuScalingPercent;
        const serviceMemory = params.ticketServiceMemory;
        const serviceMemoryScalingPercent = params.ticketServiceMemoryScalingPercent;
        const serviceMinCount = params.ticketServiceMinCount;
        const serviceMaxCount = params.ticketServiceMaxCount;
        const serviceDesiredCount = params.ticketServiceDesiredCount;
        const repository = cdk.aws_ecr.Repository.fromRepositoryName(
            this,
            `ecr-image-${application}-${service}`,
            serviceRepository,
        );

        const ticketsTable = new dynamodb.TableV2(this, `dynamodb-table-${service}`, {
            partitionKey: {
                name: "ticketId",
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: "eventId",
                type: dynamodb.AttributeType.STRING,
            },
            billing: dynamodb.Billing.onDemand(),
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // ticketsTable.addLocalSecondaryIndex({
        //     indexName: "statusIndex",
        //     sortKey: {name: "status", type: dynamodb.AttributeType.STRING},
        //     projectionType: dynamodb.ProjectionType.ALL
        // });

        // // DNS
        // const hostname = "tickets";
        // const domain = "gigaevents.com";
        // const hostheader = hostname + "." + domain;

        // Secrets
        const postgresUrl = Secret.fromSecretNameV2(this, "POSTGRES_URL", `${service}/connection`);
        postgresUrl.grantRead(props.ecsRole);

        // Fargate service
        const fargateService = new EcsFargateService(this, `${service}-fargate-service`, {
            application: app,
            service: service,
            ecsCluster: props.ecsCluster,
            ecsRole: props.ecsRole,
            ecsSecurityGroup: props.ecsSecurityGroup,
            loadBalancer: props.loadBalancer,
            loadBalancerListener: props.loadBalancerListener,
            targetGroupBlue: props.targetGroupBlue,
            targetGroupGreen: props.targetGroupGreen,
            cpuContainer: serviceCpu,
            cpuScalingPercent: serviceCpuScalingPercent,
            memoryContainer: serviceMemory,
            memoryScalingPercent: serviceMemoryScalingPercent,
            minNumberOfContainers: serviceMinCount,
            maxNumberOfContainers: serviceMaxCount,
            desiredNumberOfContainers: serviceDesiredCount,
            containerPort: containerPort,
            containerProtocol: cdk.aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
            hostPort: 80,
            dockerrepos: repository,
            dockertag: "latest",
            // webPortHttp: 80,
            // hostheader: hostheader,
            // path: "/*",
            // priority: 101,
            //subnet: getSubnets(this).private.privatesubnetaz1,
            //enableStickyness: true,
            // sgIngressRules: Array<SGIngressRules>({
            //     source: vpc.vpcCidrBlock,
            //     protocol: "TCP",
            //     port: 3000,
            //     name: "3000 from vpc cidr",
            // }),
            assignPublicIp: false,
            httpsOnContainer: false,
            vpc: props.vpc,
            environmentVars: {
                TABLENAME: ticketsTable.tableName,
            }
            // secretEnvironmentVars: {
            //     DATABASE_URL: ecs.Secret.fromSecretsManager(postgresUrl),
            // },
        });

        this.fargateService = fargateService.fargateService;
        this.fargateTaskDef = fargateService.taskDefinition;
    }
}
