const getLocalHostPortURL = (functionName, port) => {
	return `http://localhost:${port}/${functionName}`;
};

const getProvisionedVMURL = (functionName, requestId) => {
	return new Promise(async (resolve) => {
		const { getCurrentlyMappedPortForFunction } = require("./port-service");

		const alreadyProvisionedPortForFunction =
			getCurrentlyMappedPortForFunction(functionName);

		if (alreadyProvisionedPortForFunction) {
			console.log(
				"Already provisioned function",
				functionName,
				"at port",
				alreadyProvisionedPortForFunction,
				"forwarding request to",
				getLocalHostPortURL(functionName, alreadyProvisionedPortForFunction)
			);

			return resolve(
				getLocalHostPortURL(functionName, alreadyProvisionedPortForFunction)
			);
		}

		// Provision new container for function
		const pullAndRunDockerImage = require("./pull-and-run-docker-image");
		await pullAndRunDockerImage(functionName, requestId);

		const newlyProvisionedPort =
			getCurrentlyMappedPortForFunction(functionName);

		if (newlyProvisionedPort) {
			const waitOnPort = require("wait-port");
			const url = new URL(
				getLocalHostPortURL(functionName, newlyProvisionedPort)
			);

			try {
				await waitOnPort({
					host: url.hostname,
					port: Number(url.port),
					path: '/',
					timeout: 5_000,
				});
				return resolve(url.toString());
			} catch (error) {
				console.log(error);
				return resolve(null);
			}
		}

		// Something went wrong
		return resolve(null);
	});
};

module.exports = getProvisionedVMURL;
