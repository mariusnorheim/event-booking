import * as cdk from "aws-cdk-lib";
import { Parameters } from "./params";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { SGIngressRules } from "../interfaces/sg-ingress-rules";
import { applySgIngressRules } from "../utils/apply-sg-rules";

interface StackProps {
    application: string;
    vpc: ec2.IVpc;
    sgIngressRules?: Array<SGIngressRules>;
}

export class SgReusable {
    public readonly securityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, props: StackProps) {
        // define a security group for the instances
        this.securityGroup = new ec2.SecurityGroup(scope, props.application + "-reusable-sg", {
            vpc: props.vpc,
            allowAllOutbound: true, // will let your instance send outboud traffic
            securityGroupName: props.application + "-reusable-sg",
        });

        if (props.sgIngressRules) {
            applySgIngressRules(scope, this.securityGroup, props.sgIngressRules);
        }

        this.securityGroup.addIngressRule(
            ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
            ec2.Port.allIcmp(),
            "Allows ICMP",
        );

        this.securityGroup.addIngressRule(
            ec2.Peer.ipv4("192.168.0.0/19"),
            ec2.Port.tcp(3389),
            "Allows RDP",
        );
    }
}
