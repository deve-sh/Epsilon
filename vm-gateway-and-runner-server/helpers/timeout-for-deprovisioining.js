const { markPortAsDeallocatedFromContainer } = require("./port-service");

const timeoutsForDeprovisioningContainers = {};

const markDockerImageForDeprovisioningAfterInactivity = (functionName) => {
	if (timeoutsForDeprovisioningContainers[functionName])
		// Override any existing timeout for new request having come to the container
		clearTimeout(timeoutsForDeprovisioningContainers[functionName]);

	timeoutsForDeprovisioningContainers[functionName] = setTimeout(
		() => {
			console.log(
				"Deprovisioning container for function",
				functionName,
				"due to no active requests"
			);
			markPortAsDeallocatedFromContainer(functionName);
		},
		// 65 seconds of no requests to the container by default
		65 * 1000
	);
};

module.exports = markDockerImageForDeprovisioningAfterInactivity;
