# process-listener

Watch a process on my Mac and execute a shell command when entering/exiting an active state

![output](https://i.ibb.co/1fKC1Dx/Screen-Shot-2019-07-24-at-12-25-18-PM.png)

```shell
Usage: process-listener [options]

Options:
  -c --min-cpu <minCpu>             The minimum cpu % to consider the process active. E.g. 10.5 / Defaults to 0
  -e --on-end <echo "Ending!">      Execute this command on process end
  -h, --help                        output usage information
  -p --process-name <processName>   The process to watch
  -s --on-start <echo "Starting!">  Execute this command on process start
  -v --verbose                      Verbose logging
  -V, --version                     output the version number
```

## Getting started

1. Setup
   `yarn install`
1. Development
   `yarn build && process-listener -h`
