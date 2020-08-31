import type { RouteHandlerMethod } from 'fastify';

import * as path 					from 'path';
import * as importDir 		from 'directory-import';
import * as isPlainObject from 'lodash/isPlainObject';
import * as isFunction	  from 'lodash/isFunction';
import * as isArray	  		from 'lodash/isArray';
import * as forEach 			from 'lodash/forEach';
import * as has 					from 'lodash/has';

import server 			from './server';
import sanitizePath from './utils/sanitize-path';

type RouteMethodArguments = RouteHandlerMethod | [object, RouteHandlerMethod];

interface HTTPMethods {
	readonly get?:    object, s
	readonly post?:   object,
	readonly put?:    object,
	readonly update?: object,
	readonly delete?: object,
}

const schemas = {};

const supportedRouteExtensions = ['.js', '.ts'];

const routesDirectory  = './src/routes';
const schemasDirectory = './src/validation/schemas/routes';

importDir(schemasDirectory, 'sync', prepareSchemas);
importDir(routesDirectory,  'sync', prepareRoutes);

/**
 * @param {string} 			schemaName    - Schema file name
 * @param {string} 			schemaPath    - Schema file path
 * @param {HTTPMethods} schemaMethods - Exported schema methods. Ex: [GET, POST, PUT, DELETE]
 * @example {
 * 	 schemaName: "user",
 * 	 schemaPath: "schemas/user.ts"
 *   schemaMethods: {
 *     get:  { ... }
 *     post: { ... }
 *   }
 * }
 */
function prepareSchemas(schemaName: string, schemaPath: string, schemaMethods: HTTPMethods): void {
	if (!isPlainObject(schemaMethods)) {
		console.warn(`Expected an exported object with methods in file ${schemaPath}.`);

		return;
	}

	const sanitizedSchemaPath: string = sanitizePath(schemaName, schemaPath, schemasDirectory);

	schemas[sanitizedSchemaPath] = schemaMethods;
}

/**
 * @param {string} 			routeName    - Route file name
 * @param {string} 			routePath    - Route file path
 * @param {HTTPMethods} routeMethods - Exported route methods. Ex: [GET, POST, PUT, DELETE]
 *
 * @example {
 * 	 routeName: "user",
 * 	 routePath: "routes/user.ts"
 *   routeMethods: {
 *     get:  function
 *     post: function
 *   }
 * }
 */
function prepareRoutes(routeName: string, routePath: string, routeMethods: { default: HTTPMethods }): void {
	const fileExtensionName: string  = path.extname(routePath);
	const isModule				 : boolean = fileExtensionName === '.ts' || fileExtensionName === '.js';

	if (!isModule) {
		console.error(`File ${routePath} is not a route. Supported files with extensions: ${supportedRouteExtensions}`);

		return;
	}

	if (!isPlainObject(routeMethods.default)) {
		console.warn(`Expected an exported object with methods in file ${routePath}.`);

		return;
	}

	const sanitizedRoutePath: string = sanitizePath(routeName, routePath, routesDirectory);

	parseHTTPMethodsAndCreateFastifyRoutes(sanitizedRoutePath, routeMethods.default);
}

/**
 * Loop over methods and make a function call createFastifyRoute for each method
 *
 * @param {string} 			sanitizedRoutePath
 * @param {HTTPMethods} routeMethods
 */
function parseHTTPMethodsAndCreateFastifyRoutes(sanitizedRoutePath: string, routeMethods: HTTPMethods) {
	forEach(routeMethods, (routeMethodArguments, routeMethodName: string) => {
		createFastifyRoute(sanitizedRoutePath, routeMethodName, routeMethodArguments);
	});
}

/**
 * Create route by fastify
 *
 * @param {string} sanitizedRoutePath
 * @param {string} routeMethodName
 * @param {RouteMethodArguments} routeMethodArguments
 *
 * @example server.get(path, options, callback);
 */
function createFastifyRoute(sanitizedRoutePath: string, routeMethodName: string, routeMethodArguments): void {
	const schema: object = has(schemas, `${sanitizedRoutePath}.${routeMethodName}`)
		? schemas[sanitizedRoutePath][routeMethodName]
		: {};

	if (isFunction(routeMethodArguments)) {
		server[routeMethodName](sanitizedRoutePath, { schema }, routeMethodArguments);
	}

	else if (isArray(routeMethodArguments)) {
		const [options] = routeMethodArguments;

		if (!options.schema) options.schema = schema;

		server[routeMethodName](sanitizedRoutePath, ...routeMethodArguments);
	}

	else {
		console.warn(`Route ${sanitizedRoutePath} has invalid arguments: ${routeMethodArguments}`);
	}
}
