const Docker = require("dockerode");

let dockerCLIProxy = new Docker();

module.exports = dockerCLIProxy;