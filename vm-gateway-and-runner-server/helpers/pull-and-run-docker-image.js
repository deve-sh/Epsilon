const pullAndRunDockerImage = async (functionName, requestId) => {
	await require("./pull-docker-image")(functionName);
	const portAllocatedToContainer = await require("./run-docker-image")(
		functionName,
		requestId
	);

	return portAllocatedToContainer;
};

module.exports = pullAndRunDockerImage;
