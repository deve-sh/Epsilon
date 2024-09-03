const pullAndRunDockerImage = async (functionName) => {
	await require("./pull-docker-image")(functionName);
	await require("./run-docker-image")(functionName);
};

module.exports = pullAndRunDockerImage;
