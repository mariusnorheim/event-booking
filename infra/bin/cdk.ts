#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ElasticContainerServiceStack } from "../lib/ecs-stack";
import { ApplicationLoadBalancerStack } from "../lib/alb-stack";
import { TicketServiceStack } from "../lib/service-stacks/ticket-service-stack";
import { PipelineStack } from "../lib/pipeline-stack";
import { Parameters } from "../lib/utils/params";
import { PipelineServices } from "../lib/interfaces/pipeline-services";

// extract parameters
const params = new Parameters();
const application = params.application;
const region = params.region;
const app = application.replace(/ /g, "").toLowerCase(); // machine friendly name

const cdkApp = new cdk.App();
const env = {
    region: region,
    account: process.env.CDK_DEFAULT_ACCOUNT,
};

// application load balancer stack 
const albStackName = `infra-cdk-${app}-alb-stack`;
const albStack = new ApplicationLoadBalancerStack(cdkApp, albStackName, {
    env,
    stackName: albStackName,
    description: `${application} Application Load Balancer infrastructure`,
    terminationProtection: false,
});
// values returned from the load balancer stack to be used as input for other stacks
const loadBalancer = albStack.loadBalancer;
const loadBalancerListener = albStack.listener;
const targetGroupBlue = albStack.targetGroupBlue;
const targetGroupGreen = albStack.targetGroupGreen;

// ecs cluster stack
const ecsClusterStackName = `infra-cdk-${app}-ecs-stack`;
const ecsClusterStack = new ElasticContainerServiceStack(cdkApp, ecsClusterStackName, {
    env,
    vpc: albStack.vpc,
    stackName: ecsClusterStackName,
    description: `${application} ECS cluster infrastructure`,
    terminationProtection: false,
});
// values returned from the ecs stack that can be used as input for other stacks
const ecsCluster = ecsClusterStack.ecsCluster;
const ecsRole = ecsClusterStack.ecsRole;
const ecsSecurityGroup = ecsClusterStack.ecsSecurityGroup;

// // ticket service utility stack
// // this gets its own stack because it needs to be deployed before the RDS stack
// const ticketServiceStackUtilityStackName = `infra-cdk-${app}-ticket-utility-stack`;
// const ticketServiceStackUtilityStack = new InfraCostexplorerUtilityStack(
//     cdkApp,
//     ticketServiceStackUtilityStackName,
//     {
//         env,
//         stackName: ticketServiceStackUtilityStackName,
//         description: `${application} Ticket service utility infrastructure stack`,
//         terminationProtection: false,
//     },
// );

// ticket service stack
const ticketServiceStackName = `infra-cdk-${app}-ticket-service-stack`;
const ticketServiceStack = new TicketServiceStack(cdkApp, ticketServiceStackName, {
    env,
    ecsCluster: ecsCluster,
    ecsRole: ecsRole,
    ecsSecurityGroup: ecsSecurityGroup,
    loadBalancer: loadBalancer,
    loadBalancerListener: loadBalancerListener,
    targetGroupBlue: targetGroupBlue,
    targetGroupGreen: targetGroupGreen,
    vpc: albStack.vpc,
    stackName: ticketServiceStackName,
    description: `${application} Ticket service infrastructure stack`,
    terminationProtection: false,
});
ticketServiceStack.addDependency(albStack, "ALB stack needs to be deployed first");
ticketServiceStack.addDependency(ecsClusterStack, "ECS cluster stack needs to be deployed first");
// values returned from the ticket service stack that can be used as input for the service stacks
const ticketName = "ticket";
const ticketFargateService = ticketServiceStack.fargateService;
const ticketFargateTaskDef = ticketServiceStack.fargateTaskDef;


// pipeline stack
const pipelineStackName = `infra-cdk-${app}-pipeline-stack`;
// define services to be built
const pipelineServices: Array<PipelineServices> = [
    {
        name: ticketName,
        fargateService: ticketFargateService,
        fargateTaskDef: ticketFargateTaskDef,
    }
];

new PipelineStack(cdkApp, pipelineStackName, {
    env,
    loadBalancerListener: loadBalancerListener,
    targetGroupBlue: targetGroupBlue,
    targetGroupGreen: targetGroupGreen,
    services: pipelineServices,
    stackName: pipelineStackName,
    description: `${application} pipeline infrastructure stack`,
    terminationProtection: false,
});
