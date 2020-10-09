const importDir   = require('directory-import');
const forEach			= require('lodash/forEach');
const packageFile = require('./package');

const functions    = {};
const stage        = process.env.stage || 'development';
const ApiDirPath 	 = './api-config';
const servicesName = `${packageFile.name}-${stage}`
const apiConfigs	 = importDir(ApiDirPath, 'sync');

forEach(apiConfigs, prepareLambdaFunctions)

const config = {
	functions,
	versionFunctions: true,
	service:          packageFile.name,
	stackName:        servicesName,
	apiName:          servicesName,
	frameworkVersion: '2',
	endpointType:     'regional',
	provider: {
		stage,
		name:    'aws',
		runtime: `nodejs${packageFile.engines.node}`,
		region:  'eu-central-1',
		deploymentBucket: {
			name: servicesName,
		}
	},

	plugins: ['serverless-webpack'],

	apiGateway: {
		description: packageFile.description,
		metrics: true,
	},

	tracing: {
		apiGateway: true,
		lambda:     true,
	},

	package: {
		individually: true,
	},

	resources: {
		Resources: {
			MyDynamoDBTable: {
				Type: 'AWS::DynamoDB::Table',
				Properties: {
					TableName: `${servicesName}-users`,
					AttributeDefinitions: [
						{ AttributeName: 'ID', AttributeType: 'S' },
					],
					KeySchema: [
						{ AttributeName: 'ID', KeyType: 'HASH' },
					],
					BillingMode: 'PAY_PER_REQUEST',
				},
			},
		},
	},
};

function prepareLambdaFunctions(config, path) {
	const slicerStart = ApiDirPath.length + 1;
	const slicerEnd 	= path.length - '.js'.length;

	const lambdaFunctionName = path
		.slice(slicerStart, slicerEnd)
		.replace('/', '-');

	functions[lambdaFunctionName] = config;
}

module.exports = config;
