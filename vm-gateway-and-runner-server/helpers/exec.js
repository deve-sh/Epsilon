const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);

module.exports = exec;
