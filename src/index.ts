import type { RequestJobOptions } from "cronyx";
import type Job from "./job";
import JobClient from "./job-client";
import JobRunner from "./job-runner";

export { CronyxClientError } from "./error";

/**
 * @public
 */
export type Credentials = {
  username: string;
  password: string;
};

/**
 * @public
 */
export type CronyxClientOptions = {
  url: string;
  credentials?: Credentials;
};

/**
 * @public
 */
export default class CronyxClient {
  #jobClient: JobClient;

  constructor(options: CronyxClientOptions) {
    this.#jobClient = new JobClient(options.url, options.credentials);
  }

  async requestJobExec(options: RequestJobOptions, task: (job: Job) => Promise<void>): Promise<void> {
    const jobRunner = new JobRunner(this.#jobClient, options.jobName, options.jobInterval, {
      timezone: options.timezone,
      requiredJobNames: options.requiredJobNames,
      startBuffer: options.startBuffer,
      retryInterval: options.retryInterval,
      noLock: options.noLock,
      jobIntervalStartedAt: options.jobIntervalStartedAt,
    });
    return await jobRunner.requestJobExec(task);
  }

  async requestJobStart(options: RequestJobOptions): Promise<Job | null> {
    const jobRunner = new JobRunner(this.#jobClient, options.jobName, options.jobInterval, {
      timezone: options.timezone,
      requiredJobNames: options.requiredJobNames,
      startBuffer: options.startBuffer,
      retryInterval: options.retryInterval,
      noLock: options.noLock,
      jobIntervalStartedAt: options.jobIntervalStartedAt,
    });
    return await jobRunner.requestJobStart();
  }
}
