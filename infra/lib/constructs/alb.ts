import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { TargetGroupServices } from "../interfaces/target-group-services";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface ApplicationLoadBalancerProps {
    application: string;
    vpc: ec2.IVpc;
    webPortHttp: number;
    //loadBalancerSubnets: ec2.SubnetSelection;
    internetFacingLoadBalancer: boolean;
}

export class ApplicationLoadBalancer extends Construct {
    public readonly alb: elb.ApplicationLoadBalancer;
    public readonly securityGroupAlb: ec2.SecurityGroup;
    public readonly listener: elb.ApplicationListener;
    public readonly loadBalancerDns: string;
    public readonly targetGroupBlue: elb.ApplicationTargetGroup;
    public readonly targetGroupGreen: elb.ApplicationTargetGroup;

    constructor(scope: Construct, id: string, props: ApplicationLoadBalancerProps) {
        super(scope, id);

        // security group for alb created in ecs class because dns name for alb is needed as environment var for the container
        this.securityGroupAlb = new ec2.SecurityGroup(scope, `alb-sg-${props.application}`, {
            securityGroupName: `alb-sg-${props.application}`,
            vpc: props.vpc,
            allowAllOutbound: true,
        });
        this.securityGroupAlb.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            `Allow access on port 80/http`,
        );

        // create application load balancer
        this.alb = new elb.ApplicationLoadBalancer(scope, `${props.application}-alb`, {
            loadBalancerName: `alb-${props.application}`,
            vpc: props.vpc,
            internetFacing: props.internetFacingLoadBalancer,
            securityGroup: this.securityGroupAlb,
            //vpcSubnets: props.loadBalancerSubnets,
        });

        // output the dns name of load balancer
        this.loadBalancerDns = this.alb.loadBalancerDnsName;
        new cdk.CfnOutput(scope, `load-balancer-dns-${props.application}`, {
            value: this.loadBalancerDns,
            description: `${props.application}-load-balancer-dns`,
            exportName: `${props.application}-load-balancer-dns`,
        });

        // create a blue target group that routes traffic from the public Application Load Balancer (ALB) to the
        // registered targets within the target group e.g. (EC2 instances, IP addresses, Lambda functions)
        this.targetGroupBlue = new elb.ApplicationTargetGroup(
            this,
            `alb-tg-blue-${props.application}`,
            {
                targetGroupName: `alb-tg-blue-${props.application}`,
                targetType: elb.TargetType.IP,
                port: props.webPortHttp,
                vpc: props.vpc,
            },
        );
        // create a new green target group
        this.targetGroupGreen = new elb.ApplicationTargetGroup(
            this,
            `alb-tg-green-${props.application}`,
            {
                targetGroupName: `alb-tg-green-${props.application}`,
                targetType: elb.TargetType.IP,
                port: props.webPortHttp,
                vpc: props.vpc,
            },
        );

        // create http listener
        this.listener = this.alb.addListener(`alb-listener-${props.application}`, {
            open: false,
            port: props.webPortHttp,
            defaultTargetGroups: [this.targetGroupBlue],
        });
    }
}
