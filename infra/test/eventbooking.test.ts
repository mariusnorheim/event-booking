import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ApplicationLoadBalancerStack } from "../lib/alb-stack";
import { BuildDeployStack } from "../lib/pipeline-stack";

// check if the ALB Security Group allows all traffic on port 80
test("Security Group Port 80 Open", () => {
    const app = new cdk.App();
    const stack = new ApplicationLoadBalancerStack(app, "alb-test-stack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::EC2::SecurityGroup", {
        SecurityGroupIngress: [
            {
                CidrIp: "0.0.0.0/0",
                FromPort: 80,
                IpProtocol: "tcp",
                ToPort: 80,
            },
        ],
    });
});

// check if the ECS Deployment Controller is set to AWS CodeDeploy
test("Deployment Controller Set", () => {
    const app = new cdk.App();
    const stack = new BuildDeployStack(app, "build-deploy-test-stack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::ECS::Service", {
        DeploymentController: {
            Type: "CODE_DEPLOY",
        },
    });
});
