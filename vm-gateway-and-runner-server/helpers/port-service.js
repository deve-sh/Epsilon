/**
 * @type {Record<string, { port: number, requestId: string }[]>}
 */
const currentlyMappedFunctionPorts = {};

const busyPorts = new Set();

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

const markPortAsDeallocated = async (functionName, port) => {
	if (
		!port ||
		!currentlyMappedFunctionPorts[functionName] ||
		!currentlyMappedFunctionPorts[functionName].length
	)
		return;

	currentlyMappedFunctionPorts[functionName] = currentlyMappedFunctionPorts[
		functionName
	].filter((map) => map.port !== port);

	setPortBusyStatus(port, false);
};

const getCurrentlyMappedIdlePortForFunction = (functionName) => {
	if (
		!currentlyMappedFunctionPorts[functionName] ||
		!currentlyMappedFunctionPorts[functionName].length
	)
		return null;

	const portList = currentlyMappedFunctionPorts[functionName].map(
		(map) => map.port
	);

	// Not a busy port right now
	for (const port of portList) if (!busyPorts.has(port)) return port;

	// All ports busy, signal that to the consumer
	return null;
};

const setPortBusyStatus = (port, busy = true) => {
	if (busy) return busyPorts.add(port);
	return busyPorts.delete(port);
};

module.exports = {
	getAvailablePort,
	getPortAssociatedWithRequest,
	markPortAsAllocatedForContainer,
	markPortAsDeallocated,
	getCurrentlyMappedIdlePortForFunction,
	setPortBusyStatus,
};
