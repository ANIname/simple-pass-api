const config = {
	description: 'Handler showing that the server is working fine',
	handler:     `lambda/server-ping.handler`,
	events:      [
		{ http: { method: 'ANY', path: '/'            } },
		{ http: { method: 'ANY', path: '/server/ping' } },
	],
}

module.exports = config;
