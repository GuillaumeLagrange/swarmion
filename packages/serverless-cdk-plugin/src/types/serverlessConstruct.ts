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
}
