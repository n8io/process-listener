const chalk = require("chalk");
const { multiply } = require("ramda");
const psaux = require("psaux");
const shell = require("shelljs");
const { config } = require("./config");
const { log } = require("./log");
const { Status } = require("./status");

const { COMMAND_END, COMMAND_START, MIN_CPU, PID, PROCESS_NAME, USER } = config;

log(
  `\n${JSON.stringify(
    {
      MIN_CPU,
      COMMAND_END,
      PROCESS_NAME,
      COMMAND_START,
    },
    null,
    2
  )}`
);

const seconds = multiply(1000);

let wasRunning = 0;

const checkStatus = async process => {
  const list = await psaux();

  const processes = list
    .query({
      cpu: `>${MIN_CPU}`,
      command: `~${PROCESS_NAME}`,
      user: USER,
    })
    .filter(({ command, pid }) => Number(pid) !== PID);

  if (!processes.length) {
    const status = wasRunning ? Status.STOPPING : Status.NOT_RUNNING;

    wasRunning = false;

    return status;
  }

  if (processes.length > 1) {
    const APP_KEY = " -psn_";
    const names = processes.map(({ command, pid }) => `${pid}: ${command}`);
    const recommendedProcesses = processes.filter(
      ({ command }) => command.indexOf(APP_KEY) > -1
    );
    const recommendedProcess =
      recommendedProcesses.length > 0 && recommendedProcesses[0];
    const recommendedMessage = recommendedProcess
      ? `\nWe suggest using the following: --process-name="${chalk.yellow(
          recommendedProcess.command.split(APP_KEY)[0]
        )}"`
      : "";

    console.error(`
${chalk.red(
  `Multiple processes were found with the given --process-name "${PROCESS_NAME}" . Please provide a more specific --process-name. Run again with the --verbose option to show the list of processes found.`
)}
${recommendedMessage}`);

    log(`\n\t${names.join("\n\t")}`);

    return Status.NOT_RUNNING;
  }

  const status = wasRunning ? Status.RUNNING : Status.STARTING;

  wasRunning = true;

  return status;
};

const executeCommand = command => {
  log(`Executing command "${command}"...`);
  shell.exec(command, { async: true });
};

const watchProcess = async () => {
  const status = await checkStatus(PROCESS_NAME);

  switch (status) {
    case Status.STARTING:
      log(`Starting ${PROCESS_NAME}...`);
      COMMAND_START && executeCommand(COMMAND_START);
      return;
    case Status.STOPPING:
      log(`Stopping ${PROCESS_NAME}...`);
      COMMAND_END && executeCommand(COMMAND_END);
      return;
    case Status.NOT_RUNNING:
      log(`${PROCESS_NAME} not running...`);
      return;
    case Status.RUNNING:
      log(`${PROCESS_NAME} running...`);
      return;
    default:
      return;
  }
};

const start = async () => {
  await watchProcess();
  setInterval(watchProcess, seconds(3));
};

module.exports = { start };
