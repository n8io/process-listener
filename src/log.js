const logFactory = PRINT_OUTPUT => msg =>
  PRINT_OUTPUT && console.log(`${new Date().toISOString()} ${msg}`);

module.exports = { logFactory };
