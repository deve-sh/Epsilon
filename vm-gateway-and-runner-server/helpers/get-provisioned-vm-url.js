const getProvisionedVMURL = async (functionName) => {
	const { getCurrentlyMappedPortsForFunction } = require("./port-service");

	const alreadyProvisionedPortForFunction =
		getCurrentlyMappedPortsForFunction(functionName);

	if (alreadyProvisionedPortForFunction)
		return `http://localhost:${alreadyProvisionedPortForFunction}`;

    // Provision new container for Function
};

module.exports = getProvisionedVMURL;
