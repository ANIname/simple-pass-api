let requestCount = 0;

function requestCounter(): number {
	console.info(`Total requests: ${requestCount += 1}`);

	return requestCount;
}

export default requestCounter;
