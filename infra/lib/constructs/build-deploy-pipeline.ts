import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codedeploy from "aws-cdk-lib/aws-codedeploy";
import * as pipeline from "aws-cdk-lib/aws-codepipeline";
import * as pipelineactions from "aws-cdk-lib/aws-codepipeline-actions";

export interface BuildDeployPipelineProps {
    application: string;
    //selfMutation?: boolean ?? false;
    service?: string;
    codeRepository: cdk.aws_codecommit.Repository;
    containerRepository: cdk.aws_ecr.Repository;
    albListener: cdk.aws_elasticloadbalancingv2.ApplicationListener;
    targetGroupBlue: cdk.aws_elasticloadbalancingv2.ApplicationTargetGroup;
    targetGroupGreen: cdk.aws_elasticloadbalancingv2.ApplicationTargetGroup;
    fargateService: cdk.aws_ecs.FargateService;
    fargateTaskDef: cdk.aws_ecs.TaskDefinition;
}

export class BuildDeployPipeline extends Construct {
    constructor(scope: Construct, id: string, props: BuildDeployPipelineProps) {
        super(scope, id);

        // set cdk resource id
        const resourceId = props.service ? `${props.service}` : `${props.application}`;

        // create CodeBuild project that builds the Docker image
        const serviceName = props.service ? props.service : props.application;
        const buildImage = new codebuild.Project(this, `build-image-${resourceId}`, {
            buildSpec: codebuild.BuildSpec.fromSourceFilename(`${serviceName}/buildspec.yaml`),
            source: codebuild.Source.codeCommit({ repository: props.codeRepository }),
            environment: {
                privileged: true,
                environmentVariables: {
                    AWS_ACCOUNT_ID: { value: process.env?.CDK_DEFAULT_ACCOUNT || "" },
                    REGION: { value: process.env?.CDK_DEFAULT_REGION || "" },
                    IMAGE_TAG: { value: "latest" },
                    IMAGE_REPO_NAME: { value: props.containerRepository.repositoryName },
                    REPOSITORY_URI: { value: props.containerRepository.repositoryUri },
                    TASK_DEFINITION_ARN: { value: props.fargateTaskDef.taskDefinitionArn },
                    TASK_ROLE_ARN: { value: props.fargateTaskDef.taskRole.roleArn },
                    EXECUTION_ROLE_ARN: { value: props.fargateTaskDef.executionRole?.roleArn },
                },
            },
        });

        // create CodeBuild project that runs the deployment test
        const buildTest = new codebuild.Project(this, `build-deployment-test-${resourceId}`, {
            buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec-test.yaml"),
            source: codebuild.Source.codeCommit({ repository: props.codeRepository }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
            },
        });

        // grant CodeBuild project access to pull/push images from/to ECR repo
        props.containerRepository.grantPullPush(buildImage);

        // create pipeline artifacts
        const sourceArtifact = new pipeline.Artifact(`pipeline-source-artifact-${resourceId}`);
        const buildArtifact = new pipeline.Artifact(`pipeline-build-artifact-${resourceId}`);

        // create the source stage for pipeline
        const sourceStage = {
            stageName: "Source",
            actions: [
                new pipelineactions.CodeCommitSourceAction({
                    actionName: "AppCodeCommit",
                    branch: "master",
                    output: sourceArtifact,
                    repository: props.codeRepository,
                }),
            ],
        };

        // create the deployment test stage for pipeline
        const deploymentTestStage = {
            stageName: "Deployment Test",
            actions: [
                new pipelineactions.CodeBuildAction({
                    actionName: "JestCDK",
                    input: new pipeline.Artifact("SourceArtifact"),
                    project: buildTest,
                }),
            ],
        };

        // create the build stage for pipeline
        const buildStage = {
            stageName: "Build",
            actions: [
                new pipelineactions.CodeBuildAction({
                    actionName: "DockerBuildPush",
                    input: new pipeline.Artifact("SourceArtifact"),
                    project: buildImage,
                    outputs: [buildArtifact],
                }),
            ],
        };

        // create a new deployment group
        const deploymentGroup = new codedeploy.EcsDeploymentGroup(
            this,
            `deployment-group-${resourceId}`,
            {
                service: props.fargateService,
                // configurations for CodeDeploy blue/green deployments
                blueGreenDeploymentConfig: {
                    listener: props.albListener,
                    blueTargetGroup: props.targetGroupBlue,
                    greenTargetGroup: props.targetGroupGreen,
                },
            },
        );

        // create the deploy stage for pipeline
        const deployStage = {
            stageName: "Deploy",
            actions: [
                new pipelineactions.CodeDeployEcsDeployAction({
                    actionName: "EcsFargateDeploy",
                    appSpecTemplateInput: buildArtifact,
                    taskDefinitionTemplateInput: buildArtifact,
                    deploymentGroup: deploymentGroup,
                }),
            ],
        };

        // create a CodePipeline with source, build, and deploy stages
        new pipeline.Pipeline(this, `pipeline-build-deploy-${resourceId}`, {
            pipelineName: `pipeline-image-build-deploy-${resourceId}`,
            stages: [sourceStage, deploymentTestStage, buildStage, deployStage],
        });
    }
}
