const deprovisionContainer = require("./deprovision-container");
const {
	markPortAsDeallocatedFromContainer,
	getPortAssociatedWithRequest,
} = require("./port-service");

const timeoutsForDeprovisioningContainers = {};

const markDockerContainerForDeprovisioningAfterInactivity = (
	functionName,
	requestId
) => {
	const key = `${functionName}-${requestId}`;

	if (timeoutsForDeprovisioningContainers[key])
		// Override any existing timeout for new request having come to the container
		clearTimeout(timeoutsForDeprovisioningContainers[key]);

	timeoutsForDeprovisioningContainers[key] = setTimeout(
		() => {
			console.log(
				"Deprovisioning container for function",
				functionName,
				"due to no active requests"
			);
			markPortAsDeallocatedFromContainer(
				getPortAssociatedWithRequest(functionName, requestId)
			);
			deprovisionContainer(requestId);
		},
		// 60 seconds of no requests to the container by default
		60 * 1000
	);
};

module.exports = markDockerContainerForDeprovisioningAfterInactivity;
