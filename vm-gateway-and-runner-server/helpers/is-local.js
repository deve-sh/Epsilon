const isLocal = () => {
	return process.env.NODE_ENV !== "production";
};

module.exports = isLocal;
