const { multiply } = require("ramda");
const psaux = require("psaux");
const shell = require("shelljs");
const config = require("./config");
const { logFactory } = require("./log");
const { Status } = require("./status");

const {
  COMMAND_END,
  COMMAND_START,
  MIN_CPU,
  PID,
  PRINT_OUTPUT,
  PROCESS_NAME,
  USER,
} = config;

const log = logFactory(PRINT_OUTPUT);

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
    .filter(
      ({ command, pid }) =>
        Number(pid) !== PID && command.endsWith(PROCESS_NAME)
    );

  if (!processes.length) {
    const status = wasRunning ? Status.STOPPING : Status.NOT_RUNNING;

    wasRunning = false;

    return status;
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
