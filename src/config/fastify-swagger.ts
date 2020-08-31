import serverConfig from './server';

export default {
	swagger: {
		info: {
			title: 	 'Simple pass api',
			host:    serverConfig.host,
			schemes: ['http'],
			tags:    [
				{ name: 'Ping', description: 'Server health check' },
			],
		},
	},

	routePrefix: '/docs',
	exposeRoute: true,
};
