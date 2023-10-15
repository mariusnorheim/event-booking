import { Construct } from "constructs";
import * as sm from "aws-cdk-lib/aws-secretsmanager";

export interface SecretsProps {
    application: string;
    service?: string;
    name: string;
    description?: string;
}

export class Secrets extends Construct {
    public readonly secret: sm.Secret;
    constructor(scope: Construct, id: string, props: SecretsProps) {
        super(scope, id);

        // set cdk resource id based on wether service property is set
        let resourceId = props.service ? `${props.service}` : `${props.application}`;

        // create a secret
        this.secret = new sm.Secret(this, `secret-${props.name}`, {
            secretName: `${resourceId}/${props.name}`,
            description: props.description ? props.description : "",
        });
    }
}
