import * as cdk from "aws-cdk-lib";

export type PipelineServices = {
    name: string;
    fargateService: cdk.aws_ecs.FargateService;
    fargateTaskDef: cdk.aws_ecs.TaskDefinition;
};