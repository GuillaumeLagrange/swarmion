import { requestSyncDeployment } from '@swarmion/orchestrator-contracts';
import { getTrigger } from '@swarmion/serverless-contracts';
import { getHandlerPath, LambdaFunction } from '@swarmion/serverless-helpers';

const config: LambdaFunction = {
  environment: {
    ORCHESTRATOR_TABLE_NAME: '${serverlessCdkBridgePlugin:dynamodbName}',
  },
  handler: getHandlerPath(__dirname),
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Resource: ['${serverlessCdkBridgePlugin:dynamodbArn}'],
      Action: ['dynamodb:PutItem'],
    },
  ],
  iamRoleStatementsInherit: true,
  events: [getTrigger(requestSyncDeployment)],
};

export default config;
