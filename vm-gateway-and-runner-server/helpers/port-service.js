/**
 * @type {Record<string, { port: number; containerObject: any; }>}
 */
const currentlyMappedFunctions = {};

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
	{ port, containerObject }
) => {
	if (currentlyMappedFunctions[functionName] || !port) return;

	currentlyMappedFunctions[functionName] = { port, containerObject };
};

const markPortAsDeallocatedFromContainer = (functionName) => {
	if (!currentlyMappedFunctions[functionName]) return;

	// De-provision container
	if (currentlyMappedFunctions[functionName].containerObject)
		currentlyMappedFunctions[functionName].containerObject.remove();

	delete currentlyMappedFunctions[functionName];
};

const getCurrentlyMappedPortForFunction = (functionName) => {
	if (!currentlyMappedFunctions[functionName]) return null;

	return currentlyMappedFunctions[functionName].port;
};

module.exports = {
	getAvailablePort,
	markPortAsAllocatedForContainer,
	markPortAsDeallocatedFromContainer,
	getCurrentlyMappedPortForFunction,
};
