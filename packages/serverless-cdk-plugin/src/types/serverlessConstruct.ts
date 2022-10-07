import { AWS } from '@serverless/typescript';
import { Construct } from 'constructs';
import Service from 'serverless/classes/Service';

export interface ServerlessProps {
  config: AWS;
  service: Service;
}

export class ServerlessConstruct extends Construct {
  serverlessProps?: ServerlessProps;

  constructor(scope: Construct, id: string, serverlessProps?: ServerlessProps) {
    super(scope, id);

    this.serverlessProps = serverlessProps;
  }

  resolveParam(paramName: string): string {
    if (this.serverlessProps === undefined) {
      throw new Error('Cannot resolve param without the serverless config');
    }

    console.log(this.serverlessProps);

    const { config, service } = this.serverlessProps;

    if (config.params === undefined) {
      return '';
    }

    console.log(Object.keys(config.params));

    const stage = Object.keys(config.params).includes(service.provider.stage)
      ? service.provider.stage
      : 'default';

    service;

    console.log(stage);
    // config.provider.stage !== undefined &&
    // config.provider.stage in Object.keys(config.params)
    //   ? config.provider.stage
    //   : 'default';

    // console.log(JSON.stringify(serverless.params, null, 2));
    // console.log(JSON.stringify(serverless.provider.stage, null, 2));

    return config.params[stage][paramName] as string;
  }
}
