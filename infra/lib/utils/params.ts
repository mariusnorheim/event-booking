import * as fs from 'fs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";


export class Parameters {
  private _application: string;
  private _environment: string;
  private _securityGroupIngressRule1: string;
  private _securityGroupIngressRule2: string;
  private _securityGroupIngressRule3: string;
  private _description: string;
  private _key: string;
  private _volumeEncryptionKey: string;
  private _region: string;
  private _availabilityZone: string;
  private _databaseInstanceDeleteProtection: boolean;
  private _databaseInstanceClass: ec2.InstanceClass;
  private _databaseInstanceSize: ec2.InstanceSize;
  private _databaseInstanceSubnet1Id: string;
  private _databaseInstanceSubnet2Id: string;
  private _databaseEngine: rds.DatabaseInstanceEngine;
  private _databaseEngineVersion: rds.PostgresEngineVersion;
  private _databasePort: number;
  private _databaseName: string;
  private _databaseStorageType: rds.StorageType;
  private _databaseStorageEncrypted: boolean;
  private _databaseAllocatedStorage: number;
  private _databaseMaxAllocatedStorage: number;
  private _databaseBackupRetentionDays: number;
  private _databaseDeleteAutomatedBackups: boolean;
  private _cognitoPasswordMinLength: number;
  private _cognitoMfa: string;
  private _cognitoMfaSecondFactorSms: boolean;
  private _cognitoMfaSecondFactorOtp: boolean;
  private _cognitoPasswordRequireDigits: boolean;
  private _cognitoPasswordRequireSymbols: boolean;
  private _cognitoPasswordRequireUppercase: boolean;
  private _cognitoPasswordRequireLowercase: boolean;
  private _cognitoPasswordTempValidityDays: number;
  private _cognitoInvitationEmailSubject: string;
  private _cognitoInvitationEmailBody: string;
  private _fargateExec: boolean;
  private _ticketServiceContainerRepository: string;
  private _ticketServiceContainerPort: number;
  private _ticketServiceListenerPort: number;
  private _ticketServiceCpu: number;
  private _ticketServiceCpuScalingPercent: number;
  private _ticketServiceMemory: number;
  private _ticketServiceMemoryScalingPercent: number;
  private _ticketServiceMinCount: number;
  private _ticketServiceMaxCount: number;
  private _ticketServiceDesiredCount: number;

  constructor() {
      var params = JSON.parse(fs.readFileSync('./params.json', 'utf8')).Parameters;
      this._application = params.Application;
      this._environment = params.Environment;
      this._securityGroupIngressRule1 = params.SecurityGroupIngressRule1;
      this._securityGroupIngressRule2 = params.SecurityGroupIngressRule2;
      this._securityGroupIngressRule3 = params.SecurityGroupIngressRule3;
      this._description = params.Description;
      this._key = params.Key;
      this._volumeEncryptionKey = params.VolumeEncryptionKey;
      this._region = params.Region;
      this._availabilityZone = params.AvailabilityZone;
      this._databaseInstanceDeleteProtection = params.DatabaseInstanceDeleteProtection;
      this._databaseInstanceClass = params.DatabaseInstanceClass;
      this._databaseInstanceSize = params.DatabaseInstanceSize;
      this._databaseInstanceSubnet1Id = params.DatabaseInstanceSubnet1Id;
      this._databaseInstanceSubnet2Id = params.DatabaseInstanceSubnet2Id;
      this._databaseEngine = params.DatabaseEngine;
      this._databaseEngineVersion = params.DatabaseVersion;
      this._databasePort = params.DatabasePort;
      this._databaseName = params.DatabaseName;
      this._databaseStorageType = params.DatabaseStorageType;
      this._databaseStorageEncrypted = params.DatabaseStorageEncrypted;
      this._databaseAllocatedStorage = params.DatabaseAllocatedStorage;
      this._databaseMaxAllocatedStorage = params.DatabaseMaxAllocatedStorage;
      this._databaseBackupRetentionDays = params.DatabaseBackupRetentionDays;
      this._databaseDeleteAutomatedBackups = params.DatabaseDeleteAutomatedBackups;
      this._cognitoMfa = params.CognitoMfa;
      this._cognitoMfaSecondFactorSms = params.CognitoMfaSecondFactorSms;
      this._cognitoMfaSecondFactorOtp = params.CognitoMfaSecondFactorOtp;
      this._cognitoPasswordMinLength = params.CognitoPasswordMinLength;
      this._cognitoPasswordRequireDigits = params.CognitoPasswordRequireDigits;
      this._cognitoPasswordRequireSymbols = params.CognitoPasswordRequireSymbols;
      this._cognitoPasswordRequireUppercase = params.CognitoPasswordRequireUppercase;
      this._cognitoPasswordRequireLowercase = params.CognitoPasswordRequireLowercase;
      this._cognitoPasswordTempValidityDays = params.CognitoPasswordTempValidityDays;
      this._cognitoInvitationEmailSubject = params.CognitoInvitationEmailSubject;
      this._cognitoInvitationEmailBody = params.CognitoInvitationEmailBody;
      this._fargateExec = params.FargateExec;
      this._ticketServiceContainerRepository = params.TicketServiceContainerRepository;
      this._ticketServiceContainerPort = params.TicketServiceContainerPort;
      this._ticketServiceListenerPort = params.TicketServiceListenerPort;
      this._ticketServiceCpu = params.TicketServiceCpu;
      this._ticketServiceCpuScalingPercent = params.TicketServiceCpuScalingPercent;
      this._ticketServiceMemory = params.TicketServiceMemory;
      this._ticketServiceMemoryScalingPercent = params.TicketServiceMemoryScalingPercent;
      this._ticketServiceMinCount = params.TicketServiceMinCount;
      this._ticketServiceMaxCount = params.TicketServiceMaxCount;
      this._ticketServiceDesiredCount = params.TicketServiceDesiredCount;
  }

  get application(): string { return this._application; }
  get environment(): string { return this._environment; }
  get securityGroupIngressRule1(): string { return this._securityGroupIngressRule1; }
  get securityGroupIngressRule2(): string { return this._securityGroupIngressRule2; }
  get securityGroupIngressRule3(): string { return this._securityGroupIngressRule3; }
  get description(): string { return this._description; }
  get key(): string { return this._key; }
  get volumeEncryptionKey(): string { return this._volumeEncryptionKey; }
  get region(): string { return this._region; }
  get availabilityZone(): string { return this._availabilityZone; }
  get databaseInstanceDeleteProtection(): boolean { return this._databaseInstanceDeleteProtection; }
  get databaseInstanceClass(): ec2.InstanceClass { return this._databaseInstanceClass; }
  get databaseInstanceSize(): ec2.InstanceSize { return this._databaseInstanceSize; }
  get databaseInstanceSubnet1Id(): string { return this._databaseInstanceSubnet1Id; }
  get databaseInstanceSubnet2Id(): string { return this._databaseInstanceSubnet2Id; }
  get databaseEngine(): rds.DatabaseInstanceEngine { return this._databaseEngine; }
  get databaseEngineVersion(): rds.PostgresEngineVersion { return this._databaseEngineVersion; }
  get databasePort(): number { return this._databasePort; }
  get databaseName(): string { return this._databaseName; }
  get databaseStorageType(): rds.StorageType { return this._databaseStorageType; }
  get databaseStorageEncrypted(): boolean { return this._databaseStorageEncrypted; }
  get databaseAllocatedStorage(): number { return this._databaseAllocatedStorage; }
  get databaseMaxAllocatedStorage(): number { return this._databaseMaxAllocatedStorage; }
  get databaseBackupRetentionDays(): number { return this._databaseBackupRetentionDays; }
  get databaseDeleteAutomatedBackups(): boolean { return this._databaseDeleteAutomatedBackups; }
  get cognitoMfa(): string { return this._cognitoMfa; }
  get cognitoMfaSecondFactorSms(): boolean { return this._cognitoMfaSecondFactorSms; }
  get cognitoMfaSecondFactorOtp(): boolean { return this._cognitoMfaSecondFactorOtp; }
  get cognitoPasswordMinLength(): number { return this._cognitoPasswordMinLength; }
  get cognitoPasswordRequireDigits(): boolean { return this._cognitoPasswordRequireDigits; }
  get cognitoPasswordRequireSymbols(): boolean { return this._cognitoPasswordRequireSymbols; }
  get cognitoPasswordRequireUppercase(): boolean { return this._cognitoPasswordRequireUppercase; }
  get cognitoPasswordRequireLowercase(): boolean { return this._cognitoPasswordRequireLowercase; }
  get cognitoPasswordTempValidityDays(): number { return this._cognitoPasswordTempValidityDays; }
  get cognitoInvitationEmailSubject(): string { return this._cognitoInvitationEmailSubject; }
  get cognitoInvitationEmailBody(): string { return this._cognitoInvitationEmailBody; }
  get fargateExec(): boolean { return this._fargateExec; }
  get ticketServiceContainerRepository(): string { return this._ticketServiceContainerRepository; }
  get ticketServiceContainerPort(): number { return this._ticketServiceContainerPort; }
  get ticketServiceListenerPort(): number { return this._ticketServiceListenerPort; }
  get ticketServiceCpu(): number { return this._ticketServiceCpu; }
  get ticketServiceCpuScalingPercent(): number { return this._ticketServiceCpuScalingPercent; }
  get ticketServiceMemory(): number { return this._ticketServiceMemory; }
  get ticketServiceMemoryScalingPercent(): number { return this._ticketServiceMemoryScalingPercent; }
  get ticketServiceMinCount(): number { return this._ticketServiceMinCount; }
  get ticketServiceMaxCount(): number { return this._ticketServiceMaxCount; }
  get ticketServiceDesiredCount(): number { return this._ticketServiceDesiredCount; }
}
