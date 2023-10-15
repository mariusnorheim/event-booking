import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface PublicVPCProps {}

export class PublicVPC extends Construct {
    public readonly vpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props?: PublicVPCProps) {
        super(scope, id);

        // Creates VPC for the ECS Cluster
        this.vpc = new ec2.Vpc(this, "public-vpc", {
            ipAddresses: ec2.IpAddresses.cidr("10.50.0.0/16"),
        });
    }
}
