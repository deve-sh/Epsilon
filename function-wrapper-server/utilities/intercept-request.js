const interceptRequest = async (_req, res, next) => {
	const isRunningInVM = require("./is-running-in-vm");

	if (!isRunningInVM()) return next();

	const originalSendFunction = res.send;

	res.send = function (...args) {
		console.log("Function exited with status code", res.statusCode);
		originalSendFunction.call(this, ...args);
	};

	// Proceed with request
	next();
};

module.exports = interceptRequest;
