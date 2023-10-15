import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
//import { getStandardVpc, getSubnets } from "./utils/network";
import { Parameters } from "./utils/params";
import { ApplicationLoadBalancer } from "./constructs/alb";
import { PublicVPC } from "./constructs/vpc";

export interface ApplicationLoadBalancerStackProps extends cdk.StackProps {
    // properties goes here
}

export class ApplicationLoadBalancerStack extends cdk.Stack {
    public readonly loadBalancer: cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer;
    //public readonly securityGroupAlb: cdk.aws_ec2.SecurityGroup;
    public readonly listener: cdk.aws_elasticloadbalancingv2.ApplicationListener;
    //public readonly loadBalancerDns: string;
    public readonly targetGroupBlue: cdk.aws_elasticloadbalancingv2.ApplicationTargetGroup;
    public readonly targetGroupGreen: cdk.aws_elasticloadbalancingv2.ApplicationTargetGroup;
    //public secureListener: cdk.aws_elasticloadbalancingv2.ApplicationListener;
    public readonly vpc: cdk.aws_ec2.Vpc;

    constructor(scope: Construct, id: string, props?: ApplicationLoadBalancerStackProps) {
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

        // create vpc
        const publicVpc = new PublicVPC(this, "vpc");
        this.vpc = publicVpc.vpc;

        // create application load balancer
        const alb = new ApplicationLoadBalancer(this, "alb", {
            application: app,
            internetFacingLoadBalancer: true,
            //loadBalancerSubnets: getSubnets(this).public.publicsubnetmultiaz,
            vpc: this.vpc,
            webPortHttp: 80,
        });

        this.loadBalancer = alb.alb;
        this.listener = alb.listener;
        this.targetGroupBlue = alb.targetGroupBlue;
        this.targetGroupGreen = alb.targetGroupGreen;
        //this.secureListener = alb.secureListener;
    }
}
