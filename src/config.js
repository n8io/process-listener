const commander = require("commander");
const { name, version } = require("../package.json");

const args = new commander.Command();

const float = val => parseFloat(val, 10);

args
  .name(name)
  .version(version)
  .option(
    "-c --min-cpu <minCpu>",
    "The minimum cpu % to consider the process active. E.g. 10.5 / Defaults to 0",
    float
  )
  .option('-e --on-end <echo "Ending!">', "Execute this command on process end")
  .option("-p --process-name <processName>", "The process to watch")
  .option(
    '-s --on-start <echo "Starting!">',
    "Execute this command on process start"
  )
  .option("-v --verbose", "Verbose logging")
  .parse(process.argv);

const { USER } = process.env;
const { pid: PID } = process;
const {
  minCpu: MIN_CPU = 0,
  onEnd: COMMAND_END,
  processName: PROCESS_NAME,
  onStart: COMMAND_START,
  verbose,
} = args;

if (!PROCESS_NAME) {
  console.error("No --process-name was provided. See --help for more details.");
  process.exit(1);
}

if (!COMMAND_START && !COMMAND_END) {
  console.error(
    "At minimum, --on-start or --on-end is required. See --help for more details."
  );
  process.exit(1);
}

const config = {
  COMMAND_END,
  COMMAND_START,
  MIN_CPU,
  PID,
  PROCESS_NAME,
  USER,
  VERBOSE: Boolean(verbose),
};

module.exports = { config };
