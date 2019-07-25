const { config } = require("./config");

const { VERBOSE } = config;

const logFactory = msg =>
  VERBOSE && console.log(`${new Date().toISOString()} ${msg}`);

module.exports = { logFactory };
