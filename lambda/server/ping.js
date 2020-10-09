async function handler() {
	return {
		body: JSON.stringify({ message: 'pong' }),
	};
}

module.exports = { handler };
