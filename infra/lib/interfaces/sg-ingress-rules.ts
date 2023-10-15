export type SGIngressRules = {
    source: string;
    protocol: "TCP" | "UDP" | "ICMP";
    port?: number;
    name: string;
    endPortIfRange?: number;
};
