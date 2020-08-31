import type { FastifyPluginCallback } from 'fastify';

import * as importDir from 'directory-import';

import fastify 			 from 'fastify';
import fastifyConfig from './config/fastify';
import serverConfig  from './config/server';

const server 							 			 = fastify(fastifyConfig);
const fastifyMiddlewareDirectory = './src/middleware/fastify';
const fastifyHooksDirectory      = './src/hooks/fastify';

// RouteShorthandOptionsWithHandler
// RouteHandlerMethod

importDir(fastifyMiddlewareDirectory, 'sync', connectFastifyMiddlewares);
importDir(fastifyHooksDirectory,      'sync', connectFastifyHooks);

(async () => {
	const address = await server.listen(serverConfig.port, serverConfig.host);

	console.info(`Server started at ${address}`);
})();

/**
 * Connect fastify middlewares from middleware/fastify
 *
 * @param {String} 													name
 * @param {String} 													path
 * @param {[FastifyPluginCallback, object]} args
 *
 */// eslint-disable-next-line unicorn/prevent-abbreviations
function connectFastifyMiddlewares(name: string, path: string, args: { default: [FastifyPluginCallback, object] }) {
	server.register(...args.default);
}

/**
 * Connect fastify hooks from hooks/fastify
 *
 * @param {String}   name
 * @param {String}   path
 * @param {function} hook
 */
function connectFastifyHooks(name, path: string, hook) {
	server.addHook(name, hook.default);
}

export default server;
