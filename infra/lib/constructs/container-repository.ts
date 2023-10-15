import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";

export interface ContainerRepositoryProps {
    application: string;
    repositoryName: string;
    service?: string;
}

export class ContainerRepository extends Construct {
    public readonly containerRepository: ecr.Repository;
    constructor(scope: Construct, id: string, props: ContainerRepositoryProps) {
        super(scope, id);

        // Service parameters
        const removalPolicy = RemovalPolicy.RETAIN; // retain stateful resources
        //const deploymentAccount = "718906286019"; // needed if you build from a separate deployment account

        // set cdk resource id based on wether service property is set
        let resourceId = props.service ? `${props.service}` : `${props.application}`;

        this.containerRepository = new ecr.Repository(scope, `ecr-repository-${resourceId}`, {
            repositoryName: props.repositoryName,
            removalPolicy: removalPolicy,
            lifecycleRules: [
                {
                    description: "Only keep untagged images for 2 days",
                    tagStatus: ecr.TagStatus.UNTAGGED,
                    maxImageAge: Duration.days(2),
                },
                {
                    description: "Keep only 2 tagged images, expire all others",
                    tagPrefixList: ["latest"],
                    rulePriority: 2,
                    maxImageCount: 2,
                },
            ],
        });

        // // Make sure the deployment account can push to the repo
        // this.repo.addToResourcePolicy(
        //     new iam.PolicyStatement({
        //         effect: iam.Effect.ALLOW,
        //         actions: ["ecr:*"],
        //         principals: [new iam.AccountPrincipal(deploymentAccount)],
        //     })
        // );
    }
}
