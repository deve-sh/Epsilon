const pullAndRunDockerImage = async (functionName, requestId) => {
	await require("./pull-docker-image")(functionName);
	await require("./run-docker-image")(functionName, requestId);
};

module.exports = pullAndRunDockerImage;
