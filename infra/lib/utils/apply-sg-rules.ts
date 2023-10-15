import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SGIngressRules } from "../interfaces/sg-ingress-rules";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export const applySgIngressRules = (
    scope: Construct,
    sg: ec2.SecurityGroup,
    rules: Array<SGIngressRules>,
) => {
    rules.forEach((rule) => {
        if (rule.protocol == "TCP" && rule.port && rule.endPortIfRange) {
            sg.addIngressRule(
                ec2.Peer.ipv4(rule.source),
                ec2.Port.tcpRange(rule.port, rule.endPortIfRange),
                rule.name,
            );
        } else if (rule.protocol == "TCP" && rule.port && !rule.endPortIfRange) {
            sg.addIngressRule(ec2.Peer.ipv4(rule.source), ec2.Port.tcp(rule.port), rule.name);
        } else if (rule.protocol == "UDP" && rule.port && rule.endPortIfRange) {
            sg.addIngressRule(
                ec2.Peer.ipv4(rule.source),
                ec2.Port.udpRange(rule.port, rule.endPortIfRange),
                rule.name,
            );
        } else if (rule.protocol == "UDP" && rule.port && !rule.endPortIfRange) {
            sg.addIngressRule(ec2.Peer.ipv4(rule.source), ec2.Port.udp(rule.port), rule.name);
        } else if (rule.protocol == "ICMP") {
            sg.addIngressRule(ec2.Peer.ipv4(rule.source), ec2.Port.allIcmp(), rule.name);
        }
    });

    return true;
};
