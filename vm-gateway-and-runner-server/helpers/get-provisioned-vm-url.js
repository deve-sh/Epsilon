const getProvisionedVMURL = async (functionName) => {
	const { getCurrentlyMappedPortForFunction } = require("./port-service");

	const alreadyProvisionedPortForFunction =
		getCurrentlyMappedPortForFunction(functionName);

	if (alreadyProvisionedPortForFunction)
		return `http://localhost:${alreadyProvisionedPortForFunction}`;

	// Provision new container for function
	const pullAndRunDockerImage = require("./pull-and-run-docker-image");
	await pullAndRunDockerImage(functionName);

	const newlyProvisionedPort = getCurrentlyMappedPortForFunction(functionName);

	if (newlyProvisionedPort) return `http://localhost:${newlyProvisionedPort}`;

	// Something went wrong
	return null;
};

module.exports = getProvisionedVMURL;
