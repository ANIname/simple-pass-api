/* eslint-disable unicorn/filename-case */

import requestCounter from '../../utils/request-counter';

async function onRequest(): Promise<void> {
	requestCounter();
}

export default onRequest;
