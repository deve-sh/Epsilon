const runDockerImage = async (functionName, requestId) => {
	const {
		getAvailablePort,
		markPortAsAllocatedForContainer,
		markPortAsDeallocated,
	} = require("./port-service");

	const getImageTag = require("../constants/get-image-tag");
	const imageTag = getImageTag(functionName);

	try {
		const availablePort = await getAvailablePort();

		console.log(
			"Starting provisioning process for function",
			functionName,
			"on port",
			availablePort
		);

		markPortAsAllocatedForContainer(functionName, requestId, availablePort);

		const exec = require("./exec");
		const { stderr } = await exec(
			`docker run -d --rm --name ${requestId} --mount type=tmpfs,destination=/tmp --memory="512m" -p ${availablePort}:8080 ${imageTag}`
		);

		console.log(
			stderr
				? `Failed to startup container for function`
				: "Successfully started up container for function",
			functionName,
			"on port",
			availablePort
		);

		if (stderr) {
			markPortAsDeallocated(functionName, availablePort);
			return null;
		} else {
			markPortAsAllocatedForContainer(functionName, requestId, availablePort);
			return availablePort;
		}
	} catch (err) {
		console.error(err);
		throw new Error("Container failed to start in VM");
	}
};

module.exports = runDockerImage;
