import { Construct } from "constructs";
import { IgnoreMode } from 'aws-cdk-lib';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import * as path from "path";
import * as fs from 'fs';
import * as codecommit from "aws-cdk-lib/aws-codecommit";

export interface SourcecodeRepositoryProps {
    application: string;
    repositoryName: string;
    service?: string;
    sourcePath: string;
}

export class SourcecodeRepository extends Construct {
    public readonly codeRepository: codecommit.Repository;
    constructor(scope: Construct, id: string, props: SourcecodeRepositoryProps) {
        super(scope, id);

        // set cdk resource id
        const resourceId = props.service ? `${props.service}` : `${props.application}`;

        // modify gitignore file to remove unneeded files from the codecommit copy    
        let gitignore = fs.readFileSync('.gitignore').toString().split(/\r?\n/);
        gitignore.push('.git/');
        gitignore = gitignore.filter(g => g != 'node_modules/');
        gitignore.push('/node_modules/');
        
        // source files
        const codeAsset = new Asset(this, `codecommit-asset-${resourceId}`, {
            path: path.join(__dirname, props.sourcePath),
            ignoreMode: IgnoreMode.GIT,
            exclude: gitignore,
        });

        // codecommit repository
        this.codeRepository = new codecommit.Repository(this, `codecommit-repository-${resourceId}`, {
            repositoryName: props.repositoryName,
            description: `Source code for ${resourceId}`,
            // copies files from app directory to the repo as the initial commit
            code: codecommit.Code.fromAsset(codeAsset, 'master'),
        });
    }
}
