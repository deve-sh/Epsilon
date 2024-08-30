// @ts-check

const { VM_LOG_SINK_URL } = require("./constants");
const { v4 } = require("uuid");

let queuedLogEntries = [];

const createLogEntry = (severity = "info", ...logArguments) => {
	try {
		queuedLogEntries.push({
			severity,
			at: new Date(),
			id: v4(),
			functionName: process.env.FUNCTION_NAME,
			logArguments: JSON.stringify(logArguments),
		});
	} catch {}
};

const flushLogs = async () => {
	if (!queuedLogEntries.length) return;

	const fetch = require("isomorphic-fetch");

	const copiedLogEntries = [...queuedLogEntries];

	queuedLogEntries = [];

	try {
		const res = await fetch(VM_LOG_SINK_URL, {
			body: JSON.stringify(copiedLogEntries),
			headers: { "content-type": "application/json" },
			signal: AbortSignal.timeout(5000),
		});
		if (!res.ok) queuedLogEntries = [...copiedLogEntries, ...queuedLogEntries];
	} catch {
		queuedLogEntries = [...copiedLogEntries, ...queuedLogEntries];
	}
};

const setupLoggingOverride = () => {
	try {
		if (!process.env.FUNCTION_NAME) return;

		global.consoleLogOverWritten = true;

		console.log = function (...args) {
			if (global.consoleLogOverWritten) createLogEntry("info", args);
			process.stdout.write(args.join(" ") + "\n");
		};

		console.info = function (...args) {
			if (global.consoleLogOverWritten) createLogEntry("info", args);
			process.stdout.write(args.join(" ") + "\n");
		};

		console.error = function (...args) {
			if (global.consoleLogOverWritten)
				if (global.consoleLogOverWritten) createLogEntry("error", args);
			process.stderr.write(args.join(" ") + "\n");
		};

		console.warn = function (...args) {
			if (global.consoleLogOverWritten) createLogEntry("warn", args);
			process.stdout.write(args.join(" ") + "\n");
		};

		console.debug = function (...args) {
			if (global.consoleLogOverWritten) createLogEntry("debug", args);
			process.stdout.write(args.join(" ") + "\n");
		};

		console.table = function (...args) {
			if (global.consoleLogOverWritten) createLogEntry("table", args);
			process.stdout.write(args.join(" ") + "\n");
		};
	} catch (error) {
		global.consoleLogOverWritten = false;
		console.log("Error in Overwriting console listeners: ", error);
		return;
	}
};

module.exports.setupLoggingOverride = setupLoggingOverride;
module.exports.createLogEntry = createLogEntry;
module.exports.flushLogs = flushLogs;
