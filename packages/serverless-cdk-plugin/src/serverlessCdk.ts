import { AWS } from '@serverless/typescript';
import { App, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import merge from 'lodash/merge';
import * as Serverless from 'serverless';
import * as Plugin from 'serverless/classes/Plugin';
import resolveConfigPath from 'serverless/lib/cli/resolve-configuration-path';
import { O } from 'ts-toolbelt';

import {
  CloudFormationTemplate,
  ServerlessCdkPluginConfig,
  ServerlessConstruct,
} from 'types';
import {
  resolveVariablesInCdkOutput,
  throwIfBootstrapMetadataDetected,
} from 'utils';

type ServerlessConfigFile = AWS & ServerlessCdkPluginConfig;

type ResolveVariable = (variableName: string) => Promise<string>;

const resolveServerlessConfigPath = async (): Promise<string> => {
  return resolveConfigPath();
};

const getServerlessConfigFile = async (): Promise<ServerlessConfigFile> => {
  const configPath = await resolveServerlessConfigPath();

  const serverlessConfigFile = (await require(configPath)) as AWS & {
    construct: unknown;
  };

  const MyConstruct = serverlessConfigFile.construct;
  if (MyConstruct === undefined) {
    throw new Error('Missing construct property in serverless configuration');
  }

  const isConstruct =
    typeof MyConstruct === 'function' &&
    (MyConstruct.prototype instanceof ServerlessConstruct ||
      MyConstruct.prototype instanceof Construct);

  if (!isConstruct) {
    throw new Error('construct should be a ServerlessConstruct or a Construct');
  }

  return serverlessConfigFile as ServerlessConfigFile;
};

interface OptionsExtended extends Serverless.Options {
  verbose?: boolean;
}

export class ServerlessCdkPlugin implements Plugin {
  cliOptions: OptionsExtended;
  serverless: Serverless;
  hooks: Plugin.Hooks;
  commands: Plugin.Commands;
  log: Plugin.Logging['log'];
  stackName: string;
  app: App;
  stack: Stack;
  configurationVariablesSources?: Plugin.ConfigurationVariablesSources;
  construct?: ServerlessConstruct | Construct;
  constructInstantiationPromise?: Promise<void> = undefined;

  constructor(
    serverless: Serverless,
    cliOptions: OptionsExtended,
    { log }: Plugin.Logging,
  ) {
    serverless.configSchemaHandler.defineTopLevelProperty('construct', {
      type: 'object', // A class is an object
    });

    this.cliOptions = cliOptions;
    this.log = log;

    this.serverless = serverless;

    this.commands = {};

    this.stackName = 'myStackName';

    this.app = new App({
      // Used to detect asset usage through metadata
      context: { 'aws:cdk:enable-asset-metadata': true },
    });
    this.stack = new Stack(this.app, this.stackName);

    this.hooks = {
      // // initialize: async () => await this.resolveConstruct(),
      // 'after:package:compileEvents': () => this.appendCloudformationResources(),
    };

    this.configurationVariablesSources = {
      serverlessCdkBridgePlugin: {
        resolve: async ({
          resolveVariable,
          address,
        }: {
          resolveVariable: ResolveVariable;
          address: string;
        }) => {
          await this.resolveConstruct(resolveVariable);

          if (this.construct === undefined) {
            throw new Error('Construct has not been instanciated');
          }

          if (!(address in this.construct)) {
            throw new Error('Unexpected');
          }

          return {
            // @ts-expect-error we cannot know at build time if the adress key is indeed in the construct
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: this.stack.resolve(this.construct[address]),
          };
        },
      },
    };
  }

  public static getCdkPropertyHelper = <T extends Construct>(
    prop: O.SelectKeys<T, string> & string,
  ): string => {
    return `$\{serverlessCdkBridgePlugin:${prop}}`;
  };

  public static ServerlessConstruct = ServerlessConstruct;

  async resolveConstruct(resolveVariable: ResolveVariable): Promise<void> {
    if (
      this.construct === undefined &&
      this.constructInstantiationPromise === undefined
    ) {
      this.constructInstantiationPromise =
        this.instantiateConstruct(resolveVariable);
    }

    await this.constructInstantiationPromise;
  }

  async instantiateConstruct(resolveVariable: ResolveVariable): Promise<void> {
    const serverlessConfigFile = await getServerlessConfigFile();
    const ServerlessCdkConstruct = serverlessConfigFile.construct;

    const isServerlessConstruct =
      typeof ServerlessCdkConstruct === 'function' &&
      ServerlessCdkConstruct.prototype instanceof ServerlessConstruct;

    // this.serverless.pluginManager.

    if (isServerlessConstruct) {
      this.construct = new ServerlessCdkConstruct(this.stack, 'cdk', {
        config: serverlessConfigFile,
        service: this.serverless.service,
      });
    } else {
      this.construct = new ServerlessCdkConstruct(this.stack, 'cdk');
    }

    await this.appendCloudformationResources(resolveVariable);
  }

  async appendCloudformationResources(
    resolveVariable: ResolveVariable,
  ): Promise<void> {
    const { Resources, Outputs, Conditions, Mappings } = this.app
      .synth()
      .getStackByName(this.stackName).template as CloudFormationTemplate;

    const cdkCloudFormationData = { Resources, Outputs, Conditions, Mappings };

    await resolveVariablesInCdkOutput(resolveVariable, cdkCloudFormationData);

    throwIfBootstrapMetadataDetected({ Resources });

    merge(this.serverless.service, {
      resources: cdkCloudFormationData,
    });
  }
}
