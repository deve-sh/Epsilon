const deprovisionContainer = async (requestId) => {
	// De-provision container
	try {
		const exec = require("./exec");
		const { stderr } = await exec(`docker stop ${requestId}`);

		if (stderr) return;

		await exec(`docker rm ${requestId}`);
	} catch {}
};

module.exports = deprovisionContainer;
