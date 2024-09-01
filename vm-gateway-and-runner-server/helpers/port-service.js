/**
 * @type {Record<string, Set<number>>}
 */
const currentlyMappedPortsByFunctionName = {};

/**
 * @type {Record<number, string>}
 */
const currentlyMappedPortsToContainer = {};

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

const markPortAsAllocatedForContainer = (
	functionName,
	port,
	containerObject
) => {
	if (currentlyMappedPortsByFunctionName[functionName])
		currentlyMappedPortsByFunctionName[functionName].add(port);
	else currentlyMappedPortsByFunctionName[functionName] = new Set([port]);

	if (!currentlyMappedPortsToContainer[port])
		currentlyMappedPortsToContainer[port] = containerObject;
	else currentlyMappedPortsToContainer[port] = containerObject;
};

const markPortAsDeallocatedFromContainer = (functionName, port) => {
	if (currentlyMappedPortsByFunctionName[functionName])
		currentlyMappedPortsByFunctionName[functionName].delete(port);

	if (currentlyMappedPortsToContainer[port]) {
		// De-provision container
		currentlyMappedPortsToContainer[port].containerObject.remove();
		currentlyMappedPortsToContainer[port] = null;
	}
};

const getCurrentlyMappedPortsForFunction = (functionName) => {
	if (currentlyMappedPortsByFunctionName[functionName])
		return currentlyMappedPortsByFunctionName[functionName].values().next()
			.value;
	return null;
};

module.exports.getAvailablePort = getAvailablePort;

module.exports.markPortAsAllocatedForContainer =
	markPortAsAllocatedForContainer;

module.exports.markPortAsDeallocatedFromContainer =
	markPortAsDeallocatedFromContainer;

module.exports.getCurrentlyMappedPortsForFunction =
	getCurrentlyMappedPortsForFunction;
