function isRunningInVM() {
	return !!process.env.RUNNING_IN_VM;
}

module.exports = isRunningInVM;
