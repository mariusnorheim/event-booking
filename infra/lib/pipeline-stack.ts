import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Parameters } from "./utils/params";
import { PipelineServices } from "./interfaces/pipeline-services";
import { ContainerRepository } from "./constructs/container-repository";
import { SourcecodeRepository } from "./constructs/sourcecode-repository";
import { BuildDeployPipeline } from "./constructs/build-deploy-pipeline";

export interface PipelineStackProps extends cdk.StackProps {
    loadBalancerListener: cdk.aws_elasticloadbalancingv2.ApplicationListener;
    targetGroupBlue: cdk.aws_elasticloadbalancingv2.ApplicationTargetGroup;
    targetGroupGreen: cdk.aws_elasticloadbalancingv2.ApplicationTargetGroup;
    services: Array<PipelineServices>;
}

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: PipelineStackProps) {
        super(scope, id, props);

        // extract parameters
        const params = new Parameters();
        const application = params.application;
        const description = params.description;
        const environment = params.environment;
        const app = application.replace(/ /g, "").toLowerCase(); // machine friendly name

        // Tag the stack with standard tags
        cdk.Tags.of(this).add("Application", application);
        cdk.Tags.of(this).add("Description", description);
        cdk.Tags.of(this).add("Environment", environment);

        // create application codecommit repository
        new SourcecodeRepository(this, "application-repository", {
            application: app,
            sourcePath: "../../../",
            repositoryName: `source-${app}`,
        });

        // iterate services
        if (props.services) {
            props.services.forEach((service) => {
                // create a codecommit repository for services
                let serviceCodeRepository = new SourcecodeRepository(
                    this,
                    `code-repository-${service.name}`,
                    {
                        application: app,
                        service: service.name,
                        sourcePath: `../../../${service.name}/`,
                        repositoryName: `source-${app}-${service.name}`,
                    },
                );

                // create a ecr repository for services
                let serviceContainerRepository = new ContainerRepository(
                    this,
                    `container-repository-${service.name}`,
                    {
                        application: app,
                        service: service.name,
                        repositoryName: `image-${app}-${service.name}`,
                    },
                );

                // create build and deploy pipeline for services
                new BuildDeployPipeline(this, `pipeline-${app}-${service.name}`, {
                    application: app,
                    service: service.name,
                    codeRepository: serviceCodeRepository.codeRepository,
                    containerRepository: serviceContainerRepository.containerRepository,
                    albListener: props.albListener,
                    targetGroupBlue: props.targetGroupBlue,
                    targetGroupGreen: props.targetGroupGreen,
                    fargateService: service.fargateService,
                    fargateTaskDef: service.fargateTaskDef,
                });
            });
        }
    }
}
