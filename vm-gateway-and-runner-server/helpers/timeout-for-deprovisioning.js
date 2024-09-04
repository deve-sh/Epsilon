const deprovisionContainer = require("./deprovision-container");
const { markPortAsDeallocated } = require("./port-service");

const timeoutsForDeprovisioningContainers = {};

const markDockerContainerForDeprovisioningAfterInactivity = (
	functionName,
	requestId,
	port
) => {
	const key = `${functionName}-${port.toString()}`;

	if (timeoutsForDeprovisioningContainers[key])
		// Override any existing timeout for new request having come to the container
		clearTimeout(timeoutsForDeprovisioningContainers[key]);

	timeoutsForDeprovisioningContainers[key] = setTimeout(
		() => {
			console.log(
				"Deprovisioning idle container for function",
				functionName,
				"due to no active requests"
			);
			markPortAsDeallocated(functionName, port);
			deprovisionContainer(requestId);
		},
		// 60 seconds of no requests to the container by default
		60 * 1000
	);
};

module.exports = markDockerContainerForDeprovisioningAfterInactivity;
