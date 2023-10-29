import debug from "debug";

const logCronyxClient = debug("cronyx:client");

/**
 * @internal
 */
export function log(formatter: unknown, ...args: unknown[]) {
  logCronyxClient(formatter, ...args);
}
