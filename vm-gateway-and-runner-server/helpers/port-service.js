/**
 * @type {Record<string, { port: number; }>}
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

const markPortAsAllocatedForContainer = (functionName, port) => {
	if (currentlyMappedFunctionPorts[functionName] || !port) return;

	currentlyMappedFunctionPorts[functionName] = port;
};

const markPortAsDeallocatedFromContainer = async (functionName) => {
	if (!currentlyMappedFunctionPorts[functionName]) return;

	delete currentlyMappedFunctionPorts[functionName];

	// De-provision container
	const getContainerName = require("../constants/get-container-name");

	const util = require("node:util");
	const exec = util.promisify(require("node:child_process").exec);

	try {
		const { stderr } = await exec(
			`docker stop ${getContainerName(functionName)}`
		);
		if (stderr) return;
		
		await exec(`docker rm ${getContainerName(functionName)}`);
	} catch {}
};

const getCurrentlyMappedPortForFunction = (functionName) => {
	if (!currentlyMappedFunctionPorts[functionName]) return null;

	return currentlyMappedFunctionPorts[functionName];
};

module.exports = {
	getAvailablePort,
	markPortAsAllocatedForContainer,
	markPortAsDeallocatedFromContainer,
	getCurrentlyMappedPortForFunction,
};
