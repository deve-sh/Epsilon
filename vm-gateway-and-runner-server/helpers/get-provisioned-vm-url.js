const getLocalHostPortURL = (functionName, port) => {
	return `http://localhost:${port}/${functionName}`;
};

const getProvisionedVMURL = (functionName) => {
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
		await pullAndRunDockerImage(functionName);

		const newlyProvisionedPort =
			getCurrentlyMappedPortForFunction(functionName);

		if (newlyProvisionedPort) {
			// TODO: Replace with a recursive 3-4 time exponential-backoff health check
			// to see when a response comes back from the newly provisioned container - I.E: It's ready for receiving requests
			await new Promise((res) => setTimeout(res, 350));
			return resolve(getLocalHostPortURL(functionName, newlyProvisionedPort));
		}

		// Something went wrong
		return resolve(null);
	});
};

module.exports = getProvisionedVMURL;
