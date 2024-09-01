function isRunningInVM() {
	const isDocker = require('is-docker');
	return isDocker();
}

module.exports = isRunningInVM;
