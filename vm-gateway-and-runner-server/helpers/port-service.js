// @ts-check

/**
 * @type {Record<string, { port: number, requestId: string }[]>}
 */
const currentlyMappedFunctionPorts = {};

const getAvailablePort = () => {
	return new Promise((resolve, reject) => {
		const net = require("node:net");
		const srv = net.createServer();
		srv.listen(0, () => {
			const address = srv.address();

			if (!address || !("port" in address))
				return reject(new Error("No port free on host VM"));

			const port = address.port;

			srv.close((err) => {
				if (err)
					return reject(
						new Error("Something went wrong starting up daemon on host VM")
					);

				resolve(port);
			});
		});
	});
};

const markPortAsAllocatedForContainer = (functionName, requestId, port) => {
	if (
		currentlyMappedFunctionPorts[functionName] &&
		currentlyMappedFunctionPorts[functionName].find((map) => map.port === port)
	)
		return;

	if (!currentlyMappedFunctionPorts[functionName])
		currentlyMappedFunctionPorts[functionName] = [];

	currentlyMappedFunctionPorts[functionName].push({ requestId, port });
};

const getPortAssociatedWithRequest = (functionName, requestId) => {
	if (
		!currentlyMappedFunctionPorts[functionName] ||
		!currentlyMappedFunctionPorts[functionName].length
	)
		return null;

	const foundEntry = currentlyMappedFunctionPorts[functionName].find(
		(map) => map.requestId === requestId
	);

	if (!foundEntry) return null;

	return foundEntry.port;
};

const markPortAsDeallocatedFromContainer = async (functionName, port) => {
	if (
		!currentlyMappedFunctionPorts[functionName] ||
		!currentlyMappedFunctionPorts[functionName].length
	)
		return;

	currentlyMappedFunctionPorts[functionName] = currentlyMappedFunctionPorts[
		functionName
	].filter((map) => map.port !== port);
};

const getCurrentlyMappedPortForFunction = (functionName) => {
	if (
		!currentlyMappedFunctionPorts[functionName] ||
		!currentlyMappedFunctionPorts[functionName].length
	)
		return null;

	// TODO: Change this to a setup where we check for idle containers instead of just returning the last one
	return currentlyMappedFunctionPorts[functionName][
		currentlyMappedFunctionPorts[functionName].length - 1
	].port;
};

module.exports = {
	getAvailablePort,
	getPortAssociatedWithRequest,
	markPortAsAllocatedForContainer,
	markPortAsDeallocatedFromContainer,
	getCurrentlyMappedPortForFunction,
};
